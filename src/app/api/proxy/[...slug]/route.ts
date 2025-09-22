import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';

async function handler(req: NextRequest) {
  const slug = req.nextUrl.pathname.split('/api/proxy/')[1];
  if (!slug) {
    return new Response('URL is required', { status: 400 });
  }

  // Reconstruct the target URL
  const targetUrl = slug;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        ...req.headers,
        // Host and other sensitive headers are not forwarded
        'host': new URL(targetUrl).host,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'manual' // Handle redirects manually
    });

    // Handle redirects
    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
        const location = response.headers.get('location')!;
        const newUrl = new URL(location, targetUrl).toString();
        // Redirect the client to the new proxy URL
        return new Response(null, {
            status: 302,
            headers: {
                'Location': `/api/proxy/${newUrl}`
            }
        });
    }

    const contentType = response.headers.get('content-type') || '';
    const responseHeaders = new Headers(response.headers);

    // Remove headers that prevent embedding
    responseHeaders.delete('x-frame-options');
    responseHeaders.delete('content-security-policy');
    responseHeaders.set('Access-Control-Allow-Origin', '*');


    if (contentType.includes('text/html')) {
      const html = await response.text();
      const $ = cheerio.load(html);
      const baseUrl = new URL(targetUrl);

      const rewriteUrl = (attr: string) => {
        $(`[${attr}]`).each((i, el) => {
          const originalUrl = $(el).attr(attr);
          if (originalUrl) {
            const absoluteUrl = new URL(originalUrl, baseUrl.href).toString();
            $(el).attr(attr, `/api/proxy/${absoluteUrl}`);
          }
        });
      };

      rewriteUrl('href');
      rewriteUrl('src');
      rewriteUrl('action');
      
      // Handle srcset for images
      $('img[srcset]').each((i, el) => {
        const srcset = $(el).attr('srcset');
        if (srcset) {
            const newSrcset = srcset.split(',')
              .map(part => {
                  const [url, size] = part.trim().split(/\s+/);
                  if (url) {
                    const absoluteUrl = new URL(url, baseUrl.href).toString();
                    return `/api/proxy/${absoluteUrl} ${size || ''}`.trim();
                  }
                  return part;
              })
              .join(', ');
            $(el).attr('srcset', newSrcset);
        }
      });
      
      // Inject a base tag to handle relative paths loaded by JS
      $('head').prepend(`<base href="/api/proxy/${baseUrl.origin}/">`);

      const modifiedHtml = $.html();
      return new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } else {
      // For non-HTML content (CSS, JS, images), just stream it
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Error fetching the requested URL.', { status: 500 });
  }
}

export { handler as GET, handler as POST };
