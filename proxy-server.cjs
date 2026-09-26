// proxy-server.cjs
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// PASTE YOUR KEY HERE FOR LOCAL TESTING ONLY
const LOCAL_GROQ_KEY = 'gsk_PASTE_YOUR_GROQ_KEY_HERE'; 

app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LOCAL_GROQ_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.2,
                max_tokens: 1024,
                stream: true,
            }),
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Pipe the streaming response from Groq back to your local browser
        response.body.pipe(res);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
