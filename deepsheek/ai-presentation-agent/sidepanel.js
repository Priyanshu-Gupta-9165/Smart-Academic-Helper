document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Show/hide custom API config
  const aiModelSelect = document.getElementById('ai-model');
  const customApiConfig = document.getElementById('custom-api-config');
  
  aiModelSelect.addEventListener('change', () => {
    if (aiModelSelect.value === 'custom') {
      customApiConfig.classList.remove('hidden');
    } else {
      customApiConfig.classList.add('hidden');
    }
  });
  
  // Initially hide custom API config if not selected
  if (aiModelSelect.value !== 'custom') {
    customApiConfig.classList.add('hidden');
  }
  
  // Generate presentation
  const generateBtn = document.getElementById('generate-btn');
  const previewSection = document.getElementById('preview-section');
  const actionButtons = document.getElementById('action-buttons');
  const status = document.getElementById('status');
  
  generateBtn.addEventListener('click', () => {
    const topic = document.getElementById('presentation-topic').value;
    if (!topic) {
      alert('Please enter a presentation topic');
      return;
    }
    
    // Show loading status
    status.classList.remove('hidden');
    
    // Get settings
    const slideCount = parseInt(document.getElementById('slide-count').value);
    const style = document.getElementById('presentation-style').value;
    const includeImages = document.getElementById('include-images').checked;
    const includeAnimations = document.getElementById('include-animations').checked;
    const includeIcons = document.getElementById('include-icons').checked;
    
    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'generate-presentation',
      topic: topic,
      slideCount: slideCount,
      style: style,
      includeImages: includeImages,
      includeAnimations: includeAnimations,
      includeIcons: includeIcons
    }, (response) => {
      // Hide status
      status.classList.add('hidden');
      
      if (response.success) {
        // Show preview and actions
        previewSection.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        
        // Generate preview slides
        generateSlidePreview(response.outline);
      } else {
        alert(`Error: ${response.error}`);
      }
    });
  });
  
  // Chat functionality
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatContainer = document.getElementById('chat-container');
  
  function addChatMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  sendChatBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
      // Add user message
      addChatMessage(message, true);
      
      // Clear input
      chatInput.value = '';
      
      // Send message to background script for AI response
      chrome.runtime.sendMessage({
        type: 'chat-message',
        message: message
      }, (response) => {
        if (response.success) {
          addChatMessage(response.reply);
        } else {
          addChatMessage("I'm having trouble responding right now. Please try again later.", false);
        }
      });
    }
  });
  
  // Enter key in chat
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatBtn.click();
    }
  });
  
  // Export buttons
  document.getElementById('export-google-btn').addEventListener('click', () => {
    // Get current tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0].url.includes('docs.google.com/presentation')) {
        // Already on Google Slides
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'create-google-slides'
        });
      } else {
        // Open Google Slides
        chrome.tabs.create({url: 'https://docs.google.com/presentation/create'}, (newTab) => {
          setTimeout(() => {
            chrome.tabs.sendMessage(newTab.id, {
              action: 'create-google-slides'
            });
          }, 2000);
        });
      }
    });
  });
  
  document.getElementById('export-powerpoint-btn').addEventListener('click', () => {
    // Get current tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0].url.includes('office.com/powerpoint')) {
        // Already on PowerPoint Online
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'create-powerpoint'
        });
      } else {
        // Open PowerPoint Online
        chrome.tabs.create({url: 'https://www.office.com/launch/powerpoint'}, (newTab) => {
          setTimeout(() => {
            chrome.tabs.sendMessage(newTab.id, {
              action: 'create-powerpoint'
            });
          }, 2000);
        });
      }
    });
  });
  
  // Save settings
  document.getElementById('save-settings-btn').addEventListener('click', () => {
    const aiModel = document.getElementById('ai-model').value;
    const apiKey = document.getElementById('api-key').value;
    const apiUrl = document.getElementById('api-url').value;
    const defaultTemplate = document.getElementById('default-template').value;
    const autoOpen = document.getElementById('auto-open').checked;
    const autoSuggest = document.getElementById('auto-suggest').checked;
    
    chrome.storage.sync.set({
      aiModel: aiModel,
      apiKey: apiKey,
      apiUrl: apiUrl,
      defaultTemplate: defaultTemplate,
      autoOpen: autoOpen,
      autoSuggest: autoSuggest
    }, () => {
      alert('Settings saved successfully!');
    });
  });
  
  // Load settings
  chrome.storage.sync.get([
    'aiModel', 'apiKey', 'apiUrl', 'defaultTemplate', 'autoOpen', 'autoSuggest'
  ], (settings) => {
    if (settings.aiModel) document.getElementById('ai-model').value = settings.aiModel;
    if (settings.apiKey) document.getElementById('api-key').value = settings.apiKey;
    if (settings.apiUrl) document.getElementById('api-url').value = settings.apiUrl;
    if (settings.defaultTemplate) document.getElementById('default-template').value = settings.defaultTemplate;
    if (settings.autoOpen !== undefined) document.getElementById('auto-open').checked = settings.autoOpen;
    if (settings.autoSuggest !== undefined) document.getElementById('auto-suggest').checked = settings.autoSuggest;
    
    // Update custom API config visibility
    if (settings.aiModel === 'custom') {
      customApiConfig.classList.remove('hidden');
    }
  });
  
  // Generate slide preview
  function generateSlidePreview(outline) {
    const slidePreview = document.getElementById('slide-preview');
    slidePreview.innerHTML = '';
    
    outline.forEach((slide, index) => {
      const slideElement = document.createElement('div');
      slideElement.classList.add('preview-slide');
      slideElement.textContent = `${index+1}. ${slide.title}`;
      slidePreview.appendChild(slideElement);
    });
  }
  
  // Auto-open when presentation site is detected
  chrome.storage.sync.get(['autoOpen'], (settings) => {
    if (settings.autoOpen !== false) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && (
          tabs[0].url.includes('docs.google.com/presentation') || 
          tabs[0].url.includes('office.com/powerpoint')
        )) {
          // Open the side panel automatically
          chrome.sidePanel.open({ windowId: tabs[0].windowId });
        }
      });
    }
  });
});