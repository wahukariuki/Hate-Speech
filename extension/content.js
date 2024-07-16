function sendForHateSpeechDetection(text, user_id, platform) {
    chrome.runtime.sendMessage(
        { action: "checkHateSpeech", text, user_id, platform },
        (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                alert("Error: Could not connect to background script.");
                return;
            }
            if (response.error) {
                console.error(response.error);
                alert("Error: " + response.error);
                return;
            }
            alert(response.is_hate_speech ? "Hate Speech Detected" : "No Hate Speech Detected");
        }
    );
}

function checkForHateSpeech(text, user_id, platform) {
    chrome.runtime.sendMessage(
        {
            action: "checkHateSpeech",
            text: text,
            user_id: user_id,
            platform: platform
        },
        response => {
            if (response.is_hate_speech) {
                alert('Hate speech detected!');
            } else if (response.error) {
                console.error(response.error);
            } else {
                alert('No hate speech detected.');
            }
        }
    );
}

// Example usage
let exampleText = "This is an example message.";
let exampleUserId = "12345";
let examplePlatform = "twitter";

checkForHateSpeech(exampleText, exampleUserId, examplePlatform);


function monitorDOMChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const tweetButton = node.querySelector('div[data-testid="tweetButtonInline"]');
                        if (tweetButton) {
                            tweetButton.addEventListener("click", () => {
                                const tweetText = document.querySelector('div[role="textbox"]').innerText;
                                const user_id = "example_user_id"; // Replace with actual user ID
                                sendForHateSpeechDetection(tweetText, user_id, 'twitter');
                            });
                        }

                        const instaPostButton = node.querySelector('button[type="submit"]');
                        if (instaPostButton) {
                            instaPostButton.addEventListener("click", () => {
                                const instaText = document.querySelector('textarea[aria-label="Write a caption…"]').value;
                                const user_id = "example_user_id"; // Replace with actual user ID
                                sendForHateSpeechDetection(instaText, user_id, 'instagram');
                            });
                        }

                        // Add similar logic for TikTok here if needed
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

monitorDOMChanges();
