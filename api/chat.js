export const config = {
    runtime: 'edge', // This ensures true streaming via Vercel Edge Network
};

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'NVIDIA_API_KEY not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    try {
        const body = await req.json();
        delete body.apiKey; // Securely remove local key before forwarding

        // Enforce streaming mode for fast TTFB (Time To First Byte)
        body.stream = true;

        const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify(body),
        });

        // Forward headers and add CORS
        const responseHeaders = new Headers(nvidiaRes.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');

        // Return the ReadableStream directly - Vercel Edge streams this to the client
        return new Response(nvidiaRes.body, {
            status: nvidiaRes.status,
            headers: responseHeaders,
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy error: ' + err.message }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}
