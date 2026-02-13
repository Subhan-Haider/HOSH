// Guard to prevent multiple injections
if (window.HAS_HOSH_LOADED) {
    console.log("HOSH: Content script already active.");
} else {
    window.HAS_HOSH_LOADED = true;

    // Utility to clean text
    function cleanText(text) {
        return text?.replace(/\s+/g, ' ').trim() || "";
    }

    // Scrape page content relevant to Canvas
    function scrapeCanvasContent() {
        const data = {
            title: document.title,
            url: window.location.href,
            questions: [],
            mainContent: ''
        };

        const quizQuestions = document.querySelectorAll('.question');
        quizQuestions.forEach((q, index) => {
            const qText = q.querySelector('.question_text')?.innerText || '';
            const options = Array.from(q.querySelectorAll('.answer_label')).map(opt => opt.innerText.trim());
            const id = q.id || `q-${index}`;

            if (qText) {
                data.questions.push({
                    idx: index,
                    id: id,
                    text: cleanText(qText),
                    options: options
                });
            }
        });

        const mainContent = document.querySelector('#content, .ic-Layout-contentMain');
        if (mainContent) {
            data.mainContent = cleanText(mainContent.innerText).substring(0, 5000);
        }

        return data;
    }

    // Enhanced fuzzy matching for answers
    function isMatch(text1, text2) {
        if (!text1 || !text2) return false;
        const normalize = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n1 = normalize(text1);
        const n2 = normalize(text2);
        return n1.includes(n2) || n2.includes(n1);
    }

    // Inject Solve buttons into the page UI
    function injectSolveButtons() {
        const questions = document.querySelectorAll('.question:not(.hosh-processed)');
        questions.forEach(q => {
            q.classList.add('hosh-processed');
            const header = q.querySelector('.header');
            if (header) {
                const btn = document.createElement('button');
                btn.innerHTML = `⚡ SOLVE WITH HOSH`;
                btn.className = "hosh-inline-btn";
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const qText = q.querySelector('.question_text')?.innerText || '';
                    const options = Array.from(q.querySelectorAll('.answer_label')).map(o => o.innerText.trim());

                    btn.innerText = "⏳ Solving...";
                    chrome.runtime.sendMessage({
                        action: "ASK_AI",
                        prompt: `Question: ${qText}\nOptions: ${options.join(', ')}\n\nStrictly provide ONLY the correct answer text.`
                    }, (response) => {
                        if (response.answer) {
                            fillAnswer(qText, response.answer);
                            btn.innerText = "✅ Solved";
                        } else {
                            btn.innerText = "❌ Failed";
                        }
                    });
                };
                header.appendChild(btn);
            }
        });
    }

    // Check and trigger Auto-Solve if enabled in settings
    function checkAutoSolve() {
        chrome.storage.local.get(['autoSolve', 'apiKey'], (result) => {
            if (result.autoSolve && result.apiKey) {
                const questions = document.querySelectorAll('.question:not(.hosh-auto-solved)');
                questions.forEach(q => {
                    q.classList.add('hosh-auto-solved');
                    const qText = q.querySelector('.question_text')?.innerText || '';
                    const options = Array.from(q.querySelectorAll('.answer_label')).map(o => o.innerText.trim());

                    if (qText) {
                        chrome.runtime.sendMessage({
                            action: "ASK_AI",
                            prompt: `Question: ${qText}\nOptions: ${options.join(', ')}\n\nStrictly provide ONLY the correct answer text.`
                        }, (response) => {
                            if (response.answer) {
                                fillAnswer(qText, response.answer);
                            }
                        });
                    }
                });
            }
        });
    }

    // Watch for Canvas loading dynamic content
    const observer = new MutationObserver(() => {
        injectSolveButtons();
        checkAutoSolve(); // Check for auto-solve on every page change
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial runs
    injectSolveButtons();
    checkAutoSolve();

    // Listen for settings changes (react instantly when popup toggles)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            if (changes.autoSolve?.newValue === true || changes.apiKey) {
                console.log("HOSH: Auto-Apply activated or Key updated. Solving now...");
                checkAutoSolve();
            }
        }
    });

    // Enhanced Visual Feedback
    function highlightElement(el) {
        el.style.outline = "4px solid #c084fc";
        el.style.outlineOffset = "4px";
        el.style.borderRadius = "12px";
        el.style.backgroundColor = "rgba(192, 132, 252, 0.05)";
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            el.style.outline = "none";
            el.style.backgroundColor = "transparent";
        }, 5000);
    }



    // Automatically fill/select answer on page (Enhanced with Precision Clicking)
    function fillAnswer(questionText, AIAnswer) {
        const questions = document.querySelectorAll('.question');
        let found = false;
        const cleanAI = AIAnswer.toLowerCase().trim();

        for (const q of questions) {
            const qText = q.querySelector('.question_text')?.innerText || '';
            if (qText.includes(questionText) || questionText.includes(qText.substring(0, 30))) {

                const labels = q.querySelectorAll('.answer_label');

                // 1. Try Letter Match (A, B, C, D)
                const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
                if (letters.includes(cleanAI) || (cleanAI.length <= 2 && letters.includes(cleanAI[0]))) {
                    const index = letters.indexOf(cleanAI[0]);
                    if (labels[index]) {
                        const input = document.getElementById(labels[index].getAttribute('for')) || labels[index].querySelector('input');
                        if (input) {
                            input.click();
                            input.checked = true;
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            q.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            highlightElement(q);
                            return true;
                        }
                    }
                }

                // 2. Try Text Match (Force Click on precise option)
                for (const label of labels) {
                    if (isMatch(label.innerText, AIAnswer)) {
                        const input = document.getElementById(label.getAttribute('for')) || label.querySelector('input');
                        if (input) {
                            // Crucial for "Auto Choose like this"
                            input.click();
                            input.checked = true;
                            label.click(); // Click label as well for safety
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            q.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            highlightElement(q);
                            return true;
                        }
                    }
                }

                // 3. Handle Dropdowns
                const selects = q.querySelectorAll('select');
                selects.forEach(select => {
                    for (let i = 0; i < select.options.length; i++) {
                        if (isMatch(select.options[i].text, AIAnswer)) {
                            select.selectedIndex = i;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                            q.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            highlightElement(select);
                            found = true;
                        }
                    }
                });

                // 4. Handle Inputs
                const textFields = q.querySelectorAll('input[type="text"], input[type="number"], textarea');
                textFields.forEach(input => {
                    input.value = AIAnswer.replace(/[^0-9.]/g, (m) => input.type === 'number' ? '' : m).trim();
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    q.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    highlightElement(input);
                    found = true;
                });

                if (found) return true;
            }
        }
        return found;
    }

    // Detect nearest question on right-click context
    let lastRightClickEl = null;
    document.addEventListener('contextmenu', (e) => {
        lastRightClickEl = e.target;
    }, true);

    // Listen for messages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "GET_PAGE_DATA") {
            sendResponse(scrapeCanvasContent());
            return false; // Synchronous
        }

        if (request.action === "GET_CLICKED_CONTEXT") {
            const selection = window.getSelection().toString().trim();
            if (selection) {
                sendResponse({ text: selection, isSelection: true });
            } else {
                const qContainer = lastRightClickEl?.closest('.question');
                if (qContainer) {
                    const qText = qContainer.querySelector('.question_text')?.innerText || '';
                    const options = Array.from(qContainer.querySelectorAll('.answer_label')).map(o => o.innerText.trim());
                    sendResponse({ text: cleanText(qText), options: options });
                } else {
                    sendResponse({ text: cleanText(lastRightClickEl?.innerText || "") });
                }
            }
            return false; // Synchronous
        }

        if (request.action === "FILL_ANSWER") {
            const success = fillAnswer(request.questionText, request.answer);
            sendResponse({ success });
            return false; // Synchronous
        }

        if (request.action === "FILL_ALL_ANSWERS") {
            const results = request.answers.map(item => ({
                questionText: item.questionText,
                success: fillAnswer(item.questionText, item.answer)
            }));
            sendResponse({ results });
            return false;
        }

        return false;
    });

    console.log("Canvas AI Assistant Content Script Loaded");
}
