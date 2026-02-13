// Background Service Worker
const VERSION = "1.0.5-FALLBACK-V2";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// List of free models to try in order of preference
const MODELS = [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/pixtral-12b:free",
    "openrouter/auto" // Let OpenRouter handle it if others fail
];

async function callAIWithFallback(prompt, apiKey) {
    console.log(`[${VERSION}] AI REQUEST STARTED`);
    let lastError = "None";

    for (const model of MODELS) {
        console.log(`[${VERSION}] Attempting model: ${model}`);
        try {
            const response = await fetch(OPENROUTER_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey.trim()}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://canvas.instructure.com",
                    "X-Title": "HOSH"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                lastError = `HTTP ${response.status}: ${errText}`;
                console.warn(`Model ${model} HTTP Error:`, lastError);
                continue;
            }

            const data = await response.json();

            if (data.error) {
                lastError = data.error.message || JSON.stringify(data.error);
                console.warn(`Model ${model} API Error:`, lastError);
                continue;
            }

            if (data.choices && data.choices[0] && data.choices[0].message) {
                console.log(`[${VERSION}] Success with ${model}`);
                return data.choices[0].message.content;
            }
        } catch (error) {
            lastError = error.message;
            console.error(`[${VERSION}] Fetch error with ${model}:`, error);
        }
    }

    return `All models failed to respond. Technical Details: ${lastError}. Please verify your API key has "Free" model access enabled on OpenRouter.`;
}

// Register Context Menu Robustly
function initContextMenu() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "solve-question",
            title: "HOSH: Solve && Fill",
            contexts: ["all"]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Context menu error:", chrome.runtime.lastError);
            } else {
                console.log("Context menu 'HOSH' created successfully.");
            }
        });
    });
}

// Initialize on start
initContextMenu();
chrome.runtime.onInstalled.addListener(initContextMenu);
chrome.runtime.onStartup.addListener(initContextMenu);

// Handle Context Menu Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "solve-question") {
        chrome.tabs.sendMessage(tab.id, { action: "GET_CLICKED_CONTEXT" }, (context) => {
            if (chrome.runtime.lastError || !context || !context.text) {
                console.warn("Context menu error or no text found:", chrome.runtime.lastError?.message);
                return;
            }

            let prompt = "";
            if (context.isSelection) {
                prompt = `Solve this specific part of a quiz: "${context.text}". Strictly provide ONLY the correct answer text. No explanation.`;
            } else {
                prompt = `Question: ${context.text}\nOptions: ${context.options?.join(', ') || 'None'}\n\nStrictly provide ONLY the correct answer text or letter. No explanation.`;
            }

            chrome.storage.local.get(["apiKey"], (result) => {
                const key = result.apiKey;
                if (!key) {
                    console.warn("HOSH: No API Key found.");
                    return;
                }
                if (result.apiKey) console.log(`[${VERSION}] Using User-Provided API Key`);

                callAIWithFallback(prompt, key).then(answer => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "FILL_ANSWER",
                        questionText: context.text,
                        answer: answer
                    }, (res) => {
                        if (chrome.runtime.lastError) console.warn("Background fill failed:", chrome.runtime.lastError.message);
                    });
                });
            });
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "PING") {
        sendResponse({ version: VERSION, status: "ALIVE" });
        return false; // Synchronous
    }

    if (request.action === "ASK_AI") {
        chrome.storage.local.get(["apiKey"], (result) => {
            const key = result.apiKey;
            if (!key) {
                sendResponse({ error: "No API Key configured. Please add your OpenRouter key in the settings." });
                return;
            }
            if (result.apiKey) console.log(`[${VERSION}] Using User-Provided API Key for interaction`);

            callAIWithFallback(request.prompt, key)
                .then(answer => {
                    sendResponse({ answer: answer });
                })
                .catch(err => {
                    console.error("ASK_AI Error:", err);
                    sendResponse({ error: err.message || "Unknown AI error" });
                });
        });
        return true; // Asynchronous
    }

    return false; // Unhandled actions
});
