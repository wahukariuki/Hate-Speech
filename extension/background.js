chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkHateSpeech") {
        fetch('http://127.0.0.1:5000/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: message.text,
                user_id: message.user_id,
                platform: message.platform // Ensure platform is provided
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.is_hate_speech) {
                // Log the detected hate speech
                fetch('http://127.0.0.1:5000/log', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: message.user_id,
                        text: message.text,
                        timestamp: new Date().toISOString(),
                        platform: message.platform
                    })
                }).then(logResponse => logResponse.json())
                .then(logData => {
                    console.log('Log response:', logData);
                }).catch(logError => {
                    console.error('Log error:', logError);
                });

                sendResponse({ is_hate_speech: true });
            } else {
                sendResponse({ is_hate_speech: false });
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            sendResponse({ error: 'Failed to detect hate speech' });
        });

        // Required to keep the sendResponse channel open for async response
        return true;
    }
});
