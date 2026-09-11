const { execSync } = require('child_process');
const { flipText, logger } = require('./index');
const { getClipboardy } = require('./clipboard-helper');

function notifyError(message) {
	try {
		const safeMsg = message.replace(/"/g, '\\"');
		execSync(`notify-send -u critical "Text Flipper Error" "${safeMsg}"`, { stdio: 'ignore' });
	} catch (e) {
		// Ignore notification failure
	}
}

function simulateKeystroke(action) {
	const isWayland = process.env.XDG_SESSION_TYPE === 'wayland';
	const tryYdotool = () => {
		// KEY_LEFTCTRL = 29, KEY_LEFTALT = 56, KEY_RIGHTALT = 100, KEY_C = 46, KEY_V = 47
		const keycode = action === 'copy' ? 46 : 47;
		execSync(`ydotool key 29:0 56:0 100:0 29:1 ${keycode}:1 ${keycode}:0 29:0`, { stdio: 'ignore' });
	};

	const tryXdotool = () => {
		const key = action === 'copy' ? 'ctrl+c' : 'ctrl+v';
		execSync(`xdotool key --clearmodifiers ${key}`, { stdio: 'ignore' });
	};

	if (isWayland) {
		try {
			tryYdotool();
			return;
		} catch (err) {
			logger(`ydotool failed, trying xdotool: ${err.message}`, 'verbose');
			tryXdotool();
			return;
		}
	} else {
		try {
			tryXdotool();
			return;
		} catch (err) {
			logger(`xdotool failed, trying ydotool: ${err.message}`, 'verbose');
			tryYdotool();
			return;
		}
	}
}

async function main() {
	let originalClipboard = '';
	let clipboardy;
	try {
		logger('Starting text flip process');
		// Small delay to ensure user released shortcut modifier keys
		await new Promise(resolve => setTimeout(resolve, 150));

		clipboardy = await getClipboardy();

		// 1. Read and stash original clipboard content
		try {
			originalClipboard = await clipboardy.read();
			logger('Stashed original clipboard content', 'verbose');
		} catch (err) {
			logger(`Failed to read original clipboard: ${err.message}`, 'error');
		}

		// 2. Copy selected text
		logger('Copying selected text');
		simulateKeystroke('copy');

		// 3. Wait for clipboard to update (race condition prevention)
		await new Promise(resolve => setTimeout(resolve, 150));

		// 4. Read from clipboard
		const text = await clipboardy.read();
		if (!text || text.trim() === '') {
			logger('Clipboard is empty or whitespace only', 'verbose');
			return;
		}
		logger(`Read text from clipboard: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`, 'verbose');

		// 5. Flip text
		const flipped = flipText(text);
		if (flipped === text) {
			logger('Text remains same after flipping', 'verbose');
			return;
		}
		logger('Text flipped successfully', 'verbose');

		// 6. Write back to clipboard
		await clipboardy.write(flipped);

		// 7. Paste back
		logger('Pasting flipped text');
		simulateKeystroke('paste');

		// 8. Wait for paste to register
		await new Promise(resolve => setTimeout(resolve, 150));
	} catch (error) {
		logger(`Error in main process: ${error.message}`, 'error');
		if (error.stack) {
			logger(error.stack, 'error');
		}
		notifyError(error.message);
	} finally {
		// 9. Restore original clipboard content
		if (clipboardy && originalClipboard !== undefined) {
			try {
				await clipboardy.write(originalClipboard);
				logger('Restored original clipboard content', 'verbose');
			} catch (err) {
				logger(`Failed to restore original clipboard: ${err.message}`, 'error');
			}
		}
	}
}

main();

module.exports = { main, simulateKeystroke, notifyError };
