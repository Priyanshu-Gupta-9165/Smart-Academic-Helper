// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'create-google-slides') {
    createGoogleSlidesPresentation();
    sendResponse({success: true});
  }
  else if (message.action === 'create-powerpoint') {
    createPowerPointPresentation();
    sendResponse({success: true});
  }
  return true;
});

// Create Google Slides presentation
function createGoogleSlidesPresentation() {
  console.log("Creating Google Slides presentation");
  
  // This would use the Google Slides API in a real implementation
  alert('Creating Google Slides presentation...');
  
  // Simulate creating slides
  setTimeout(() => {
    alert('Google Slides presentation created successfully!');
  }, 2000);
}

// Create PowerPoint presentation
function createPowerPointPresentation() {
  console.log("Creating PowerPoint presentation");
  
  // This would use the Office.js API in a real implementation
  alert('Creating PowerPoint presentation...');
  
  // Simulate creating slides
  setTimeout(() => {
    alert('PowerPoint presentation created successfully!');
  }, 2000);
}

// Auto-open side panel when on presentation sites
chrome.storage.sync.get(['autoOpen'], (settings) => {
  if (settings.autoOpen !== false) {
    if (window.location.href.includes('docs.google.com/presentation') || 
        window.location.href.includes('office.com/powerpoint')) {
      chrome.runtime.sendMessage({action: 'open-side-panel'});
    }
  }
});