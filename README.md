# Text Flipper

A standalone Ubuntu utility that flips selected text between English (US QWERTY) and Hebrew (Standard SI 1452) keyboard layouts.

## Installation

1. **Install System Dependencies:**
   ```bash
   sudo apt update
   sudo apt install xdotool xclip
   ```

2. **Install Project Dependencies:**
   ```bash
   npm install
   ```

## System Integration (Ubuntu)

To use the global shortcut (`Alt+Shift+W`) to flip text:

1. Go to **Settings** -> **Keyboard**.
2. Click **View and Customize Shortcuts**.
3. Select **Custom Shortcuts** at the bottom.
4. Click **Add Shortcut** (+).
   - **Name:** Text Flipper
   - **Command:** `bash -i -c "node /home/stav/Projects/text-flipper/flip.js"`
     *(Note: Using `bash -i -c` ensures that your NVM environment is loaded correctly.)*
   - **Shortcut:** `Alt+Shift+W` (or your preferred shortcut)

## How to Use

1. Select the text you typed in the wrong layout (e.g., "akuo" instead of "שלום").
2. Press your configured shortcut (`Alt+Shift+W`).
3. The text will be flipped and replaced automatically.

## Troubleshooting & Logging

The utility logs its activity to `log.txt` in the project directory. If the shortcut isn't working, check this file for errors.

You can control the logging level in `index.js`:
```javascript
const LOG_LEVEL = 'errors'; // Only log errors (default)
// const LOG_LEVEL = 'verbose'; // Log every step for debugging
```

## Development

### Running Tests
```bash
npm test
```

### Mapping
The utility uses a bidirectional mapping between US QWERTY and Hebrew Standard SI 1452. It automatically detects the language based on the majority of characters in the selection.
