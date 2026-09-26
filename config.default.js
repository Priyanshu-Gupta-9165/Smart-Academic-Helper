// Default config for deployed site
// The backend (api/chat.js) now handles the API key securely via Vercel Environment Variables.
if (typeof PROXY_URL === 'undefined') var PROXY_URL = '/api/chat';
