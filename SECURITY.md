# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

We take the security of HOSH seriously. If you believe you have found a security vulnerability, please do NOT open a public issue. Instead, please report it through one of the following methods:

1.  **GitHub Private Reporting**: If enabled on the repository, use the "Report a vulnerability" button in the **Security** tab.
2.  **Contact**: Reach out to the maintainer ([Subhan-Haider](https://github.com/Subhan-Haider)) directly via GitHub.

We will acknowledge your report within 48 hours and provide a timeline for a fix if applicable.

## Security Best Practices for Users

- **API Keys**: Your OpenRouter API key is stored locally in your browser's `chrome.storage.local`. It is only sent to `openrouter.ai` to process your requests. Never share your key with anyone.
- **Official Source**: Only install HOSH from the official [Chrome Web Store](https://chrome.google.com/webstore) or this official GitHub repository.
- **Permissions**: HOSH only requests permissions necessary for its functionality (`activeTab`, `storage`, `scripting`, `contextMenus`). We do not require broad access to all websites.
