// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// API Configuration
const API_KEY = 'AIzaSyDi8azds2EkWBoOy8b2PbWEGbsydgflG9w';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

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

    // First render math, then markdown
    let processed = renderMath(text);
    return marked.parse(processed);
}

// Create a bot message div with avatar (returns the content element for typing)
function createBotMessageDiv() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-robot"></i>
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

// ChatGPT-style typing effect: reveal text word by word
async function typeResponse(messageDiv, fullText) {
    const contentEl = messageDiv.querySelector('.message-content');
    const renderedHTML = renderMarkdown(fullText);

    // Create a hidden div to hold the full rendered content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderedHTML;

    // Get all the text content split into words
    const words = fullText.split(/(\s+)/);
    let currentText = '';

    // Remove typing indicator
    const typingIndicator = contentEl.querySelector('.typing-indicator');
    if (typingIndicator) typingIndicator.remove();

    // Type word by word
    for (let i = 0; i < words.length; i++) {
        currentText += words[i];

        // Re-render markdown at intervals for smooth appearance
        if (i % 3 === 0 || i === words.length - 1) {
            contentEl.innerHTML = renderMarkdown(currentText);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Typing speed: faster for spaces, slight pause for punctuation
        const word = words[i];
        let delay = 20;
        if (word.match(/[.!?]\s*$/)) delay = 80;
        else if (word.match(/[,;:]\s*$/)) delay = 40;
        else if (word.trim() === '') delay = 5;

        await new Promise(r => setTimeout(r, delay));
    }

    // Final render to ensure complete formatting
    contentEl.innerHTML = renderMarkdown(fullText);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add user message
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle API request with retry logic
async function generateResponse(prompt, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: SYSTEM_INSTRUCTION }]
                    },
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.status === 429) {
                console.warn(`Rate limited (attempt ${attempt + 1}/${retries}). Retrying...`);
                await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
                continue;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error(`API Error ${response.status}:`, errData);
                return `Sorry, the AI service returned an error (${response.status}). Please try again later.`;
            }

            const data = await response.json();

            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
            console.error('Unexpected response:', data);
            return "Sorry, I received an unexpected response. Please try again.";
        } catch (error) {
            console.error(`Network error (attempt ${attempt + 1}):`, error);
            if (attempt === retries - 1) {
                return "Sorry, I couldn't connect to the AI service. Check your internet and try again.";
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return "The AI service is busy. Please try again in a moment.";
}

// Handle user input
async function handleUserInput() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    // Disable input while processing
    sendBtn.disabled = true;
    userInput.disabled = true;

    // Add user message
    addUserMessage(prompt);
    userInput.value = '';

    // Create bot message with typing indicator
    const botMessageDiv = createBotMessageDiv();

    try {
        const response = await generateResponse(prompt);
        // Type out the response like ChatGPT
        await typeResponse(botMessageDiv, response);
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
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});
