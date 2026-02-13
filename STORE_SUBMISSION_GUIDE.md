# HOSH Chrome Web Store Submission Guide

This document contains all the text required for the Chrome Web Store developer console. Copy and paste each section into the corresponding fields.

---

## 🎯 Store Listing (Product Details)

### Item Title
`HOSH`

### Summary
`The Elite AI Assistant for Canvas Instructure. Analyze, solve, and fill quiz data instantly.`

### Description
HOSH: The Elite AI Assistant for Canvas Instructure

HOSH is a powerful, hyper-intelligent browser extension designed specifically for students and educators using the Canvas LMS. By integrating state-of-the-art AI directly into your learning workflow, HOSH transforms the way you interact with quiz content, study materials, and page data.

**Key Features:**
* ⚡ **Neural Solver:** Instantly analyze complex quiz questions and receive precise, AI-calculated answers in seconds.
* 🪄 **Auto-Fill Protocol:** One-click automation to solve and fill entire pages of questions, saving you hours of manual data entry.
* 🎨 **Premium UI:** A stunning "Midnight Cobalt" dark theme designed for focus, clarity, and late-night productivity.
* 🧠 **Context-Aware Solving:** Select any text or right-click any question to trigger a targeted HOSH Solve directly from the context menu.
* 🛡️ **Privacy-First:** HOSH only activates on Canvas and educational domains. Your data is processed securely via OpenRouter with zero broad website tracking.

**Why install HOSH?**
Whether you're reviewing a difficult chapter or preparing for a complex quiz, HOSH provides a secondary "neural" layer to your browser. It’s not just a tool; it’s an evolution in digital learning efficiency. 

**Getting Started:**
1. Install HOSH and enter your OpenRouter API key.
2. Navigate to your Canvas portal.
3. Click "Solve All" or use the right-click menu to activate the neural core.

---

## 🛡️ Privacy Compliance

### Single Purpose Description
HOSH is a dedicated AI educational assistant designed exclusively for the Canvas Instructure platform. Its single, narrow purpose is to analyze quiz questions on the active page to provide real-time, AI-powered answers and automated form-filling, helping students interact more efficiently with their educational content.

### Permission Justifications

**activeTab**
Used to gain temporary access to the user's current Canvas tab when the extension is activated. This allows HOSH to read the page structure and question data to provide analysis without requiring broad access to all websites.

**storage**
Required to store the user's OpenRouter API key and user preferences (like the Auto-Solve toggle state) locally on the device. No data is stored on external servers except for the API key used for processing chat requests.

**scripting**
Necessary to programmatically inject the content script into Canvas pages. This ensures the extension can dynamically place "Solve" buttons within the Canvas UI and interact with question elements to automate answer selection.

**contextMenus**
Used to provide a "HOSH: Solve & Fill" option in the browser's right-click menu. This allows users to instantly solve specific highlighted questions or text sections within the Canvas interface.

**Host Permission Justification**
These patterns (https://*.instructure.com/*, *://*.edu/*) are required to allow HOSH to interact with the DOM of Canvas-hosted learning portals. This access is strictly used to scrape quiz question text and automate the selection of the correct answer choices.

### Remote Code
**Are you using remote code?**
No, I am not using Remote code. (HOSH is fully self-contained in your package; it only makes API calls.)

### Data Usage
**What user data do you plan to collect?**
* **Website Content:** (Check this box).
* **Justification:** The extension reads the text of quiz questions and answer options on the page to send them to the AI model (OpenRouter) for the sole purpose of generating educational answers.

**Disclosures (Certify all three):**
1. I do not sell or transfer user data to third parties.
2. I do not use or transfer user data for purposes unrelated to the single purpose.
3. I do not use or transfer user data to determine creditworthiness.
