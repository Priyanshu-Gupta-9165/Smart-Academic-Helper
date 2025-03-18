// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// API Configuration
const API_KEY = 'AIzaSyB07lUH97H9nKbOnlIXYisnbzW-xPol_eo';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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

    // Add temporary bot message
    const tempMessage = addMessage('Thinking...', false);

    try {
        // Generate response
        const response = await generateResponse(prompt);
        // Remove temporary message
        chatMessages.lastChild.remove();
        // Add final response
        addMessage(response);
    } catch (error) {
        chatMessages.lastChild.remove();
        addMessage("Oops! Something went wrong. Please try again.");
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});

