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

// Render math expressions using KaTeX
function renderMath(text) {
    // Block math: $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
        try {
            if (typeof katex !== 'undefined') {
                return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
            }
        } catch (e) { console.warn('KaTeX error:', e); }
        return `<div class="math-block">${expr.trim()}</div>`;
    });

    // Inline math: $...$
    text = text.replace(/\$([^$\n]+?)\$/g, (match, expr) => {
        try {
            if (typeof katex !== 'undefined') {
                return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
            }
        } catch (e) { console.warn('KaTeX error:', e); }
        return `<code class="math-inline">${expr.trim()}</code>`;
    });

    return text;
}

// Render markdown to formatted HTML
function renderMarkdown(text) {
    if (typeof marked === 'undefined') return text;
    let processed = renderMath(text);
    return marked.parse(processed);
}

// Create a bot message div with avatar (returns the message div)
function createBotMessageDiv() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-brain"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// ChatGPT-style typing effect: reveal text word by word (used for error messages)
async function typeResponse(messageDiv, fullText) {
    const contentEl = messageDiv.querySelector('.message-content');

    const typingIndicator = contentEl.querySelector('.typing-indicator');
    if (typingIndicator) typingIndicator.remove();

    contentEl.innerHTML = renderMarkdown(fullText);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add user message
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-user-graduate"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Stream response from NVIDIA DeepSeek API via proxy
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
                    apiKey: NVIDIA_API_KEY,
                    model: NVIDIA_MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_INSTRUCTION + `\n\nCurrent Date and Time: ${new Date().toLocaleString()}` },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.2, // Gemma works best with lower temperatures
                    top_p: 0.7,
                    max_tokens: 1024, // Gemma output limit
                    stream: true
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
                return `Sorry, the AI service returned an error (${response.status}). Please try again later.`;
            }

            // Remove typing indicator
            const typingIndicator = contentEl.querySelector('.typing-indicator');
            if (typingIndicator) typingIndicator.remove();

            // Read SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let reasoningText = '';
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

                        // Handle reasoning content (thinking tokens)
                        if (delta.reasoning_content) {
                            reasoningText += delta.reasoning_content;
                        }

                        // Handle regular content
                        if (delta.content) {
                            fullText += delta.content;
                        }

                        // Update display
                        if (delta.content || delta.reasoning_content) {
                            let displayHTML = '';
                            if (reasoningText) {
                                displayHTML += `<details class="thinking-section"><summary>💭 Thinking...</summary><div class="thinking-content">${renderMarkdown(reasoningText)}</div></details>`;
                            }
                            displayHTML += renderMarkdown(fullText);
                            contentEl.innerHTML = displayHTML;
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (e) {
                        // Skip malformed JSON chunks
                    }
                }
            }

            // Final render
            let finalHTML = '';
            if (reasoningText) {
                finalHTML += `<details class="thinking-section"><summary>💭 Thinking...</summary><div class="thinking-content">${renderMarkdown(reasoningText)}</div></details>`;
            }
            finalHTML += renderMarkdown(fullText || 'Sorry, I received an empty response. Please try again.');
            contentEl.innerHTML = finalHTML;
            chatMessages.scrollTop = chatMessages.scrollHeight;

            return null; // streaming handled directly

        } catch (error) {
            console.error(`Network error (attempt ${attempt + 1}):`, error);
            if (attempt === 2) {
                return "Sorry, I couldn't connect to the AI service. Make sure the proxy server is running (node proxy-server.js) and try again.";
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

    sendBtn.disabled = true;
    userInput.disabled = true;

    addUserMessage(prompt);
    userInput.value = '';
    userInput.style.height = 'auto'; // Reset textarea height

    const botMessageDiv = createBotMessageDiv();

    try {
        const fallbackText = await generateResponse(prompt, botMessageDiv);
        if (fallbackText) {
            await typeResponse(botMessageDiv, fallbackText);
        }
    } catch (error) {
        const contentEl = botMessageDiv.querySelector('.message-content');
        contentEl.innerHTML = '<p>Oops! Something went wrong. Please try again.</p>';
    } finally {
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent default newline
        handleUserInput();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
});
