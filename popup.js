document.addEventListener('DOMContentLoaded', () => {
    const setupView = document.getElementById('setup-view');
    const chatView = document.getElementById('chat-view');
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyBtn = document.getElementById('save-key');
    const cancelSetupBtn = document.getElementById('cancel-setup');
    const settingsBtn = document.getElementById('settings-btn');
    const useBuiltinBtn = document.getElementById('use-builtin');
    const showKeyInputBtn = document.getElementById('show-key-input');
    const providerChoice = document.getElementById('provider-choice');
    const keyInputArea = document.getElementById('key-input-area');
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const analyzeBtn = document.getElementById('analyze-page');
    const pageTitle = document.getElementById('page-title');
    const autoSolveToggle = document.getElementById('auto-solve-toggle');

    let isInitialized = false;

    let currentPageData = null;

    // Check for API Key and Toggle State
    chrome.storage.local.get(['apiKey', 'autoSolve'], (result) => {
        if (result.autoSolve) autoSolveToggle.checked = true;

        if (result.apiKey) {
            isInitialized = true;
            setupView.classList.add('hidden');
            initializePageData();
        } else {
            setupView.classList.remove('hidden');
        }
    });

    settingsBtn.addEventListener('click', () => {
        providerChoice.classList.remove('hidden');
        keyInputArea.classList.add('hidden');
        cancelSetupBtn.classList.remove('hidden');
        setupView.classList.remove('hidden');
    });

    useBuiltinBtn.addEventListener('click', () => {
        // Removed hardcoded key. Users must now provide their own.
        providerChoice.classList.add('hidden');
        keyInputArea.classList.remove('hidden');
        addMessage("Built-in AI requires a personal OpenRouter API Key. Please enter yours below.", 'ai');
    });

    showKeyInputBtn.addEventListener('click', () => {
        providerChoice.classList.add('hidden');
        keyInputArea.classList.remove('hidden');
    });

    cancelSetupBtn.addEventListener('click', () => {
        setupView.classList.add('hidden');
    });

    autoSolveToggle.addEventListener('change', () => {
        const isEnabled = autoSolveToggle.checked;
        chrome.storage.local.set({ autoSolve: isEnabled }, () => {
            if (isEnabled && currentPageData?.questions?.length > 0) {
                addMessage("Auto-Apply activated. Triggering neural core...", 'ai');
                analyzeBtn.click();
            }
        });
    });

    // Save API Key
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            chrome.storage.local.set({ apiKey: key }, () => {
                isInitialized = true;
                setupView.classList.add('hidden');
                cancelSetupBtn.classList.add('hidden');
                if (!currentPageData) initializePageData();
                addMessage("Neural core re-calibrated with new key.", 'ai');
            });
        }
    });

    async function initializePageData() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab?.url && (tab.url.includes('instructure.com') || tab.url.includes('.edu'))) {
            const sendAction = () => {
                chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_DATA" }, (responses) => {
                    if (chrome.runtime.lastError) {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content.js']
                        }).then(() => {
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_DATA" }, (retryResponse) => {
                                    if (retryResponse) handleData(retryResponse);
                                });
                            }, 100);
                        }).catch(err => {
                            addMessage("Error: Could not connect to the page. Try refreshing.", 'ai');
                        });
                        return;
                    }
                    if (responses) handleData(responses);
                });
            };

            const handleData = (responses) => {
                currentPageData = responses;
                pageTitle.innerText = responses.title ? responses.title.substring(0, 30) + "..." : "Canvas Page";
                addMessage(`Neural scan complete. Found ${responses.questions?.length || 0} questions.`, 'ai');
                analyzeBtn.disabled = false;
                sendBtn.disabled = false;

                if (autoSolveToggle.checked && responses.questions?.length > 0) {
                    setTimeout(() => analyzeBtn.click(), 500);
                }
            };
            sendAction();
        } else {
            pageTitle.innerText = "OUTSIDE CANVAS";
            addMessage("Please navigate to Canvas to activate neural assist.", 'ai');
            analyzeBtn.disabled = true;
            sendBtn.disabled = true;
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = sender === 'ai' ? 'msg ai' : 'msg user';
        div.innerText = text;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        const context = currentPageData ? `Context: ${JSON.stringify(currentPageData)}\n\n` : '';
        const prompt = `${context}Instructions: Provide strictly only the correct answer(s). No explanation or analysis.\nUser Question: ${text}`;

        addMessage("Solving...", 'ai');

        chrome.runtime.sendMessage({ action: "ASK_AI", prompt: prompt }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("HOSH: Popup closed before AI could respond.");
                return;
            }
            // Remove "Thinking..." message
            if (chatHistory.lastChild) chatHistory.removeChild(chatHistory.lastChild);

            if (response.error) {
                addMessage(`Error: ${response.error}`, 'ai');
            } else {
                addMessage(response.answer, 'ai');
            }
        });
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        if (!currentPageData || !currentPageData.questions.length) {
            addMessage("No quiz questions detected on this page.", 'ai');
            return;
        }

        const questionsList = currentPageData.questions.map((q, i) => `Q${(typeof q.idx === 'number' ? q.idx : i) + 1}: ${q.text}\nOptions: ${q.options.join(', ')}`).join('\n\n');
        const solvePrompt = `Based on the following Canvas quiz questions, provide ONLY the correct answer for each. Format as 'Q#: Answer'. Do not provide any analysis, summaries, or explanations. Just the answers.\n\n${questionsList}`;

        addMessage("Solving page questions...", 'ai');

        chrome.runtime.sendMessage({ action: "ASK_AI", prompt: solvePrompt }, (response) => {
            if (chrome.runtime.lastError) return;
            if (chatHistory.lastChild) chatHistory.removeChild(chatHistory.lastChild);

            if (response.error) {
                addMessage(`Error: ${response.error}`, 'ai');
            } else {
                addMessage(response.answer, 'ai');

                // Batch-fill all answers for stability
                const batch = [];
                const lines = response.answer.split('\n');
                lines.forEach(line => {
                    const match = line.match(/^Q(\d+):\s*(.*)/i);
                    if (match) {
                        const qNum = parseInt(match[1]);
                        const answer = match[2].trim();
                        const question = currentPageData.questions.find((q, i) => (typeof q.idx === 'number' ? q.idx : i) + 1 === qNum);
                        if (question) {
                            batch.push({ questionText: question.text, answer: answer });
                        }
                    }
                });

                if (batch.length > 0) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "FILL_ALL_ANSWERS",
                        answers: batch
                    }, (res) => {
                        if (chrome.runtime.lastError) {
                            console.log("HOSH: Batch fill channel closed (expected on closure).");
                        }
                    });
                }
            }
        });
    });
});
