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
            <p>${message}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Stream response via secure backend proxy
async function generateResponse(prompt, messageDiv) {
    const contentEl = messageDiv.querySelector('.message-content');

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // REMOVED apiKey and model from here! The backend handles it securely now.
                    messages: [
                        { role: 'system', content: SYSTEM_INSTRUCTION + `\n\nCurrent Date and Time: ${new Date().toLocaleString()}` },
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (response.status === 429) {
                const wait = 5000 * (attempt + 1);
                console.warn(`Rate limited (attempt ${attempt + 1}/3). Waiting ${wait / 1000}s...`);
                await new Promise(r => setTimeout(r, wait));
                continue;
            }

            if (!response.ok) {
                const errData = await response.text();
                console.error(`API Error ${response.status}:`, errData);
                return `Sorry, the AI service returned an error (${response.status}). ${errData}`;
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
                        }

                        // Update display
                        if (delta.content) {
                            contentEl.innerHTML = fullText;
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (e) {
                        // Skip malformed JSON chunks
                    }
                }
            }

            // Final render
            contentEl.innerHTML = fullText || 'Sorry, I received an empty response. Please try again.';
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

// Handle user input
async function handleUserInput() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    // Add user message
    addMessage(prompt, true);
    userInput.value = '';

    // Add bot message placeholder (streaming will fill it)
    const botMessage = addMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', false);

    try {
        // Generate response (streams directly into botMessage)
        const error = await generateResponse(prompt, botMessage);
        if (error) {
            const contentEl = botMessage.querySelector('.message-content');
            contentEl.innerHTML = `<p>${error}</p>`;
        }
    } catch (err) {
        const contentEl = botMessage.querySelector('.message-content');
        contentEl.innerHTML = '<p>Oops! Something went wrong. Please try again.</p>';
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});
