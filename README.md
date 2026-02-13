# Canvas AI Assistant Extension

A powerful AI-powered browser extension designed for `canvas.instructure.com`. It helps students by reading page data, extracting quiz questions, and providing AI-generated answers.

## Features
- **Page Analysis**: Extracts current Canvas page content.
- **Quiz Assistant**: Automatically detects quiz questions and options.
- **AI Chat**: Interact with the page content using Gemini (or other AI models).
- **Premium UI**: Modern dark-mode interface with glassmorphism.

## Installation
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `canvas_ai_assistant` folder.

## Setup
1. Once installed, click the extension icon.
2. Choose your processing core:
   - **Use Built-in AI**: Fast, free, and works out of the box.
   - **Use Custom API Key**: Connect your own **OpenRouter** key for personalized control.
3. You can switch between built-in AI and your custom key anytime by clicking the **Settings (gear)** icon.
4. Navigate to any Canvas page (e.g., a quiz or assignment).
5. Click **Solve Quiz Data** or ask a question in the chat.

## File Structure
- `manifest.json`: Extension configuration.
- `popup.html/.css/.js`: The user interface.
- `content.js`: Scrapes Canvas data from the browser tab.
- `background.js`: Handles API communication with AI services.

## Note on Security
Ensure you keep your API key private. The key is stored locally in your browser's storage.
