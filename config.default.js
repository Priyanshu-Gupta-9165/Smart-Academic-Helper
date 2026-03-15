// Default config for deployed site (no secrets here — API key is in Vercel env vars)
// Locally, config.js overrides this file (config.js is in .gitignore)
if (typeof NVIDIA_API_KEY === 'undefined') var NVIDIA_API_KEY = '';
if (typeof NVIDIA_MODEL === 'undefined') var NVIDIA_MODEL = 'google/gemma-3-4b-it';
if (typeof PROXY_URL === 'undefined') var PROXY_URL = '/api/chat';
