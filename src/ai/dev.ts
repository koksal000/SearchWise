'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-video-data-from-search-results.ts';
import '@/ai/flows/get-image-search-terms.ts';
import '@/ai/flows/can-be-iframed.ts';
import '@/ai/flows/scrape-google-search-results.ts';
