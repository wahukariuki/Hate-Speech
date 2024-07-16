async function analyzeText(text) {
    try {
        const response = await fetch('https://127.0.0.1/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });
        const result = await response.json();
        return result.is_hate_speech;
    } catch (error) {
        console.error('Error detecting hate speech:', error);
        return false;
    }
  }
  
  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'analyze_text') {
        const isHateSpeech = await analyzeText(message.text);
        if (isHateSpeech) {
            chrome.runtime.sendMessage({
                type: 'hate_speech_detected',
                text: message.text
            });
        }
    }
  });
  