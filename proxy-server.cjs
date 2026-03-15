const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const parsed = JSON.parse(body);
            const apiKey = parsed.apiKey;
            delete parsed.apiKey;

            const requestBody = JSON.stringify(parsed);

            const options = {
                hostname: 'integrate.api.nvidia.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            const apiReq = https.request(options, (apiRes) => {
                res.writeHead(apiRes.statusCode, {
                    ...apiRes.headers,
                    'Access-Control-Allow-Origin': '*'
                });
                apiRes.pipe(res);
            });

            apiReq.on('error', (err) => {
                console.error('Proxy error:', err);
                res.writeHead(502);
                res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
            });

            apiReq.write(requestBody);
            apiReq.end();
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`✅ NVIDIA API Proxy running at http://localhost:${PORT}`);
    console.log(`   Forwarding requests to ${NVIDIA_API_URL}`);
});
