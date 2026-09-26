// api/chat.js
export const runtime = 'edge'; // Uses Vercel's Edge Runtime for ultra-fast streaming

export default async function handler(req) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { messages } = await req.json();
        
        // Securely get the API key from Vercel Environment Variables
        const groqApiKey = process.env.GROQ_API_KEY; 
        if (!groqApiKey) {
            return new Response(JSON.stringify({ error: 'Server Error: GROQ_API_KEY is missing in Vercel settings.' }), { status: 500 });
        }

        // Call Groq's API instead of NVIDIA
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Groq's smartest and fastest free model
                messages: messages,
                temperature: 0.2,
                max_tokens: 1024,
                stream: true, // REQUIRED for your frontend typing effect
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            return new Response(errText, { status: response.status });
        }

        // Stream the response directly back to the frontend (Standard Edge Streaming)
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
