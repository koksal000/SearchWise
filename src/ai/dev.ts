'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/get-image-search-terms.ts';
import '@/ai/flows/can-be-iframed.ts';
