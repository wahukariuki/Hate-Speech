document.getElementById("check-now").addEventListener("click", () => {
    const user_id = "example_user_id"; 
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const tab = tabs[0];
            const url = tab.url;
  
            if (url.startsWith("chrome://")) {
                alert("Cannot run script on a chrome:// URL.");
                return;
            }
  
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: () => document.body.innerText,
                },
                (results) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        alert("Error: " + chrome.runtime.lastError.message);
                        return;
                    }
  
                    if (results && results[0] && results[0].result) {
                        const text = results[0].result;
                        chrome.runtime.sendMessage(
                            { action: "checkHateSpeech", text, user_id },
                            (response) => {
                                if (response && response.is_hate_speech !== undefined) {
                                    alert(response.is_hate_speech ? "Hate Speech Detected" : "No Hate Speech Detected");
                                } else {
                                    alert("Error: No response or invalid response from background script.");
                                }
                            }
                        );
                    } else {
                        alert("Error: Unable to retrieve text from the current tab.");
                    }
                }
            );
        } else {
            alert("Error: No active tab found.");
        }
    });
  });
  