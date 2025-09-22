
const COMMON_TLDS = ['com', 'org', 'net', 'tk', 'vercel.app', 'app', 'io', 'dev', 'co', 'gov', 'edu', 'ai'];

export function isValidUrl(query: string): boolean {
  if (!query) return false;

  query = query.trim();

  // Check for protocol
  if (query.startsWith('http://') || query.startsWith('https://')) {
    return true;
  }

  // Check for common TLDs
  const parts = query.split('.');
  const lastPart = parts[parts.length - 1].split('/')[0];
  if (parts.length > 1 && COMMON_TLDS.includes(lastPart)) {
    return true;
  }

  // Check for localhost
  if (query.startsWith('localhost:')) {
    return true;
  }

  return false;
}

export function normalizeUrl(query: string): string {
    let url = query.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if(url.startsWith('localhost:')) {
            url = 'http://' + url;
        } else {
            url = 'https://' + url;
        }
    }
    return url;
}
