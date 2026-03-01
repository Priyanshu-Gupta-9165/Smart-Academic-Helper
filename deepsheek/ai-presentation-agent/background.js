// Free Pixabay API key
const PIXABAY_API_KEY = '38012768-fbcb0b07d2bcee7f8c5d1d3f4';

// Handle messages from side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'generate-presentation') {
    generatePresentation(request).then(result => {
      sendResponse(result);
    });
    return true; // Indicates we wish to send a response asynchronously
  }
  
  if (request.type === 'chat-message') {
    handleChatMessage(request.message).then(result => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'open-side-panel') {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
  }
});

// Generate presentation outline
async function generatePresentation(params) {
  try {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate outline based on parameters
    const outline = [];
    for (let i = 0; i < params.slideCount; i++) {
      outline.push({
        title: `Slide ${i+1}: ${getSlideTitle(params.topic, i, params.slideCount)}`,
        content: `Content for slide ${i+1} about ${params.topic}`,
        image: params.includeImages ? await getImage(params.topic) : ''
      });
    }
    
    return {
      success: true,
      outline: outline,
      message: `Created ${params.style} presentation about ${params.topic}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get slide title based on position
function getSlideTitle(topic, index, total) {
  const titles = [
    "Introduction",
    "Key Concepts",
    "Research Findings",
    "Data Analysis",
    "Case Studies",
    "Implementation",
    "Benefits",
    "Challenges",
    "Solutions",
    "Future Outlook",
    "Conclusion"
  ];
  
  if (index === 0) return `Introduction to ${topic}`;
  if (index === total - 1) return `Conclusion: Key Takeaways`;
  
  // Return a relevant title based on position
  const position = index / (total - 1);
  if (position < 0.3) return titles[1];
  if (position < 0.6) return titles[3];
  return titles[7];
}

// Handle chat messages
async function handleChatMessage(message) {
  try {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate relevant response
    const responses = [
      "For an effective presentation, I recommend starting with a compelling introduction that hooks your audience.",
      "Based on your topic, consider including data visualizations to make your points more impactful.",
      "A good structure is key: introduction, main points, supporting evidence, and a memorable conclusion.",
      "I suggest using the 'Professional Blue' template for a business setting, or 'Creative Colorful' for a more casual audience.",
      "Remember to keep text minimal on slides - use bullet points and let your speech provide the details.",
      "Adding relevant images can increase audience engagement by up to 65% according to recent studies.",
      "For your topic, I recommend focusing on three key points with supporting examples for each."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      success: true,
      reply: randomResponse
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get image from Pixabay
async function getImage(keyword) {
  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&per_page=3`
    );
    
    const data = await response.json();
    return data.hits[0]?.webformatURL || '';
  } catch (error) {
    console.error('Image fetch error:', error);
    return '';
  }
}