// GetColor Extension - Background Service Worker
// This file handles background tasks and extension lifecycle

// Extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    console.log('GetColor extension installed/updated:', details.reason);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'getTabInfo':
            // Future: Get current tab information
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('GetColor extension started');
});

// Handle extension suspend/resume (Manifest V3)
chrome.runtime.onSuspend.addListener(() => {
    console.log('GetColor extension suspended');
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
