// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// System instruction for precise, concise responses
const SYSTEM_INSTRUCTION = `You are BrainBuddy, a smart AI study assistant.

RULES:
- Give PRECISE and CONCISE answers. Do NOT over-explain.
- Answer EXACTLY what is asked — nothing more, nothing less.
- For simple questions, give short direct answers.
- For complex topics, structure with headings and bullet points but keep it brief.
- Use **bold** for key terms.
- Use \`code\` for formulas, equations, variables, or code.
- Use code blocks for multi-line code only.
- Use bullet points for lists, numbered steps for procedures.
- Include ONE clear example when helpful, not multiple.
- Skip unnecessary introductions like "Great question!" or "Sure, let me explain..."
- Get straight to the answer.
- Be accurate and to the point like a textbook, not chatty.`;

// Add message to chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="message-content">
            ${message}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Show typing indicator (bouncing dots)
function showTypingIndicator() {
    return addMessage(`
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `, false);
}

// Build the fetch request — uses Groq directly if API key is available, otherwise uses proxy
function buildFetchRequest(prompt) {
    const messages = [
        { role: 'system', content: SYSTEM_INSTRUCTION + `\n\nCurrent Date and Time: ${new Date().toLocaleString()}` },
        { role: 'user', content: prompt }
    ];

    // If GROQ_API_KEY is set (from config.js), call Groq directly
    if (typeof GROQ_API_KEY !== 'undefined' && GROQ_API_KEY) {
        return {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: typeof GROQ_MODEL !== 'undefined' ? GROQ_MODEL : 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: 0.2,
                    top_p: 0.7,
                    max_tokens: 1024,
                    stream: true
                })
            }
        };
    }

    // Otherwise use the backend proxy (for Vercel deployment)
    const proxyUrl = typeof PROXY_URL !== 'undefined' ? PROXY_URL : '/api/chat';
    return {
        url: proxyUrl,
        options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messages })
        }
    };
}

// Stream response from API
async function generateResponse(prompt, messageDiv) {
    const contentEl = messageDiv.querySelector('.message-content');

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const { url, options } = buildFetchRequest(prompt);
            const response = await fetch(url, options);

            if (response.status === 429) {
                const wait = 5000 * (attempt + 1);
                console.warn(`Rate limited (attempt ${attempt + 1}/3). Waiting ${wait / 1000}s...`);
                await new Promise(r => setTimeout(r, wait));
                continue;
            }

            if (!response.ok) {
                const errData = await response.text();
                console.error(`API Error ${response.status}:`, errData);
                return `Sorry, the AI service returned an error (${response.status}).`;
            }

            // Remove typing indicator
            const typingIndicator = contentEl.querySelector('.typing-indicator');
            if (typingIndicator) typingIndicator.remove();

            // Read SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;

                    const data = trimmed.slice(6);
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta;
                        if (!delta) continue;

                        if (delta.content) {
                            fullText += delta.content;
                            // Live update with simple markdown rendering
                            contentEl.innerHTML = renderSimpleMarkdown(fullText);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (e) {
                        // Skip malformed JSON chunks
                    }
                }
            }

            // Final render
            contentEl.innerHTML = renderSimpleMarkdown(fullText || 'Sorry, I received an empty response. Please try again.');
            contentEl.classList.add('done'); // Stop blinking cursor
            chatMessages.scrollTop = chatMessages.scrollHeight;

            return null; // streaming handled directly

        } catch (error) {
            console.error(`Network error (attempt ${attempt + 1}):`, error);
            if (attempt === 2) {
                return "Sorry, I couldn't connect to the AI service. Check your internet connection and try again.";
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return "The AI is rate-limited right now. Please wait a moment and try again.";
}

// Simple markdown renderer for chat responses
function renderSimpleMarkdown(text) {
    // Use marked.js if available
    if (typeof marked !== 'undefined') {
        try {
            return marked.parse(text);
        } catch (e) {
            console.warn('marked.js error:', e);
        }
    }
    
    // Basic fallback markdown rendering
    let html = text
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        // Line breaks
        .replace(/\n/g, '<br>');
    
    return html;
}

// Handle user input
async function handleUserInput() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    // Disable input while processing
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message
    addMessage(prompt, true);
    userInput.value = '';

    // Show typing animation
    const botMessage = showTypingIndicator();

    try {
        // Generate response (streams directly into botMessage)
        const error = await generateResponse(prompt, botMessage);
        if (error) {
            const contentEl = botMessage.querySelector('.message-content');
            contentEl.innerHTML = `<p>${error}</p>`;
            contentEl.classList.add('done');
        }
    } catch (err) {
        const contentEl = botMessage.querySelector('.message-content');
        contentEl.innerHTML = '<p>Oops! Something went wrong. Please try again.</p>';
        contentEl.classList.add('done');
    } finally {
        // Re-enable input
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});
