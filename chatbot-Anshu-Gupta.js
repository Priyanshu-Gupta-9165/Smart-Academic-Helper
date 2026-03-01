// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotOverlay = document.getElementById('chatbot-overlay');
const chatbotCloseBtn = document.getElementById('chatbot-close-btn');

// API Configuration
const API_KEY = 'AIzaSyB07lUH97H9nKbOnlIXYisnbzW-xPol_eo';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Add message to chat with typing animation for bot messages
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="message-content">
            ${isUser ? `<p>${message}</p>` : '<div class="typing-content"></div>'}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // For bot messages, add typing animation
    if (!isUser) {
        const typingContent = messageDiv.querySelector('.typing-content');
        typeMessage(message, typingContent);
    } else {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Typing animation function (ChatGPT-style - word by word)
function typeMessage(fullMessage, container) {
    const words = fullMessage.split(/(\s+)/);
    let wordIndex = 0;
    
    function typeNext() {
        if (wordIndex < words.length) {
            const currentText = words.slice(0, wordIndex + 1).join('');
            // Parse markdown as we type
            container.innerHTML = marked.parse(currentText);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            wordIndex++;
            
            // Check for fullscreen expansion during typing
            if (wordIndex % 10 === 0) { // Check every 10 words
                checkChatbotHeight();
            }
            
            // Adjust typing speed - faster for short words, slower for long words
            const word = words[wordIndex - 1];
            const delay = word.length > 15 ? 50 : word.length > 8 ? 35 : 25;
            setTimeout(typeNext, delay);
        } else {
            // After typing completes, check one more time
            setTimeout(() => {
                checkChatbotHeight();
            }, 100);
        }
    }
    
    // Start typing animation
    typeNext();
}

// Handle API request
async function generateResponse(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('API Error:', error);
        return "Sorry, I'm having trouble understanding. Please try again.";
    }
}

// Handle user input
async function handleUserInput() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    // Add user message
    addMessage(prompt, true);
    userInput.value = '';

    // Add temporary bot message (no typing animation for "Thinking...")
    const tempMessageDiv = document.createElement('div');
    tempMessageDiv.className = 'message bot';
    tempMessageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>Thinking...</p>
        </div>
    `;
    chatMessages.appendChild(tempMessageDiv);

    try {
        // Generate response
        const response = await generateResponse(prompt);
        // Remove temporary message
        if (chatMessages.lastChild) {
            chatMessages.lastChild.remove();
        }
        // Add final response with typing animation
        addMessage(response);
    } catch (error) {
        if (chatMessages.lastChild) {
            chatMessages.lastChild.remove();
        }
        addMessage("Oops! Something went wrong. Please try again.");
    }
}

// Fullscreen functionality
function expandChatbot() {
    chatbotContainer.classList.add('fullscreen');
    chatbotOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Ensure proper centering after adding class
    requestAnimationFrame(() => {
        const rect = chatbotContainer.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate center position
        const centerX = viewportWidth / 2;
        const centerY = viewportHeight / 2;
        
        // Apply center positioning
        chatbotContainer.style.top = '50%';
        chatbotContainer.style.left = '50%';
        chatbotContainer.style.transform = 'translate(-50%, -50%)';
    });
}

function collapseChatbot() {
    chatbotContainer.classList.remove('fullscreen');
    chatbotOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset inline styles
    chatbotContainer.style.top = '';
    chatbotContainer.style.left = '';
    chatbotContainer.style.transform = '';
}

// Check if chatbot should auto-expand based on scroll overflow
function checkChatbotHeight() {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
        // Check if messages are overflowing (scroll needed)
        const hasOverflow = chatMessages.scrollHeight > chatMessages.clientHeight;
        const containerHeight = chatbotContainer.offsetHeight;
        const messagesHeight = chatMessages.scrollHeight;
        
        // Also check if content height exceeds a threshold
        const shouldExpand = hasOverflow || messagesHeight > 350;
        
        if (shouldExpand && !chatbotContainer.classList.contains('fullscreen')) {
            expandChatbot();
        }
    });
}

// Monitor chat messages for height changes
const messagesObserver = new MutationObserver(() => {
    // Add a small delay to ensure DOM is fully updated
    setTimeout(() => {
        checkChatbotHeight();
    }, 50);
});

messagesObserver.observe(chatMessages, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});

// Also check on window resize
window.addEventListener('resize', () => {
    checkChatbotHeight();
});

// Initial check after page load
setTimeout(() => {
    checkChatbotHeight();
}, 500);

// Handle "AI Assistant" link clicks
document.querySelectorAll('a[href="#chatbot"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        expandChatbot();
        // Smooth scroll to chatbot section
        document.getElementById('chatbot').scrollIntoView({ behavior: 'smooth' });
    });
});

// Close button handler
chatbotCloseBtn.addEventListener('click', collapseChatbot);

// Close when clicking overlay
chatbotOverlay.addEventListener('click', (e) => {
    if (e.target === chatbotOverlay) {
        collapseChatbot();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbotContainer.classList.contains('fullscreen')) {
        collapseChatbot();
    }
});

// Event Listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});
