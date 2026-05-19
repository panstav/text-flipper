const { execSync } = require('child_process');
const { flipText, logger } = require('./index');
const { getClipboardy } = require('./clipboard-helper');

async function main() {
	let originalClipboard = '';
	let clipboardy;
	try {
		logger('Starting text flip process');
		clipboardy = await getClipboardy();

		// 1. Read and stash original clipboard content
		try {
			originalClipboard = await clipboardy.read();
			logger('Stashed original clipboard content', 'verbose');
		} catch (err) {
			logger(`Failed to read original clipboard: ${err.message}`, 'error');
		}

		// 2. Copy selected text
		logger('Copying selected text via xdotool');
		execSync('xdotool key --clearmodifiers ctrl+c');

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
		logger('Pasting flipped text via xdotool');
		execSync('xdotool key --clearmodifiers ctrl+v');

		// 8. Wait for paste to register
		await new Promise(resolve => setTimeout(resolve, 150));
	} catch (error) {
		logger(`Error in main process: ${error.message}`, 'error');
		if (error.stack) {
			logger(error.stack, 'error');
		}
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
