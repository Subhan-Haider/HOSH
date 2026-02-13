# Chrome Web Store Privacy Submission Data

This document provides the exact text and answers for the **Privacy** tab in the Chrome Web Store Developer Console for the **HOSH** extension.

---

### **Single purpose**
**Single purpose description**
> HOSH provides an AI-powered assistant for Canvas Instructure and educational platforms, enabling students to extract quiz questions, analyze page content, and receive instant AI-generated answers and explanations directly within their browser tab.

---

### **Permission justification**

**activeTab justification**
> Required to access and read the content of the user's currently active Canvas or educational page when they initiate a scan or use the AI assistant. This ensures the extension only interacts with pages the user explicitly chooses.

**storage justification**
> Necessary to store user settings locally on their device, including preferred AI models, auto-solve preferences, and the user-provided OpenRouter API key for persistent access across sessions.

**scripting justification**
> Used to inject UI elements (such as "Solve" buttons) and processing logic directly into the Canvas interface, allowing for seamless interaction between the AI assistant and the web page content.

**contextMenus justification**
> Enables a "Solve & Fill" feature in the browser's right-click context menu, allowing users to quickly trigger AI analysis on specific text selections or individual quiz questions.

**Host permission justification**
> Grants access to `*.instructure.com/*` and `*.edu/*` domains to allow the assistant to function across various Canvas university instances and general educational websites where students require AI help.

---

### **Remote code**

**Are you using remote code?**
> **No, I am not using Remote code**

---

### **Data usage**

**What user data do you plan to collect from users now or in the future?**
> [X] **Website content**

**Justification for Website content**
> The extension reads the text of quiz questions and answer options on the page to provide them as context to the AI model for the sole purpose of generating accurate educational answers and automating form-filling.

**Certifications**
* [X] I do not sell or transfer user data to third parties, outside of the approved use cases
* [X] I do not use or transfer user data for purposes that are unrelated to my item's single purpose
* [X] I do not use or transfer user data to determine creditworthiness or for lending purposes

---

### **Privacy policy**

**Privacy policy URL**
> `https://www.blizflow.online/privacy`
