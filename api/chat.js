const https = require('https');

module.exports = (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'NVIDIA_API_KEY not configured' });
        return;
    }

    // Remove apiKey from body if sent from frontend, use env var instead
    const body = { ...req.body };
    delete body.apiKey;

    const requestBody = JSON.stringify(body);

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
        // Forward status and headers
        const headers = {
            'Content-Type': apiRes.headers['content-type'] || 'application/json',
            'Access-Control-Allow-Origin': '*'
        };
        if (apiRes.headers['transfer-encoding']) {
            headers['Transfer-Encoding'] = apiRes.headers['transfer-encoding'];
        }
        res.writeHead(apiRes.statusCode, headers);
        apiRes.pipe(res);
    });

    apiReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(502).json({ error: 'Proxy error: ' + err.message });
    });

    apiReq.write(requestBody);
    apiReq.end();
};
