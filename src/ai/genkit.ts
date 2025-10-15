import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Debug: Check if API key is loaded
const apiKey = process.env.GOOGLE_GENAI_API_KEY;
console.log('🔑 API Key loaded:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No - API key is missing!');

if (!apiKey) {
  console.error('❌ GOOGLE_GENAI_API_KEY is not set in environment variables!');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    })
  ],
  model: 'googleai/gemini-pro',
});
