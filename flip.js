const { execSync } = require('child_process');
const { flipText, logger } = require('./index');

async function main() {
	try {
		logger('Starting text flip process');
		const clipboardy = (await import('clipboardy')).default;

		// 1. Copy selected text
		logger('Copying selected text via xdotool');
		execSync('xdotool key --clearmodifiers ctrl+c');

		// 2. Wait for clipboard to update (race condition prevention)
		await new Promise(resolve => setTimeout(resolve, 150));

		// 3. Read from clipboard
		const text = await clipboardy.read();
		if (!text || text.trim() === '') {
			logger('Clipboard is empty or whitespace only', 'verbose');
			return;
		}
		logger(`Read text from clipboard: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`, 'verbose');

		// 4. Flip text
		const flipped = flipText(text);
		if (flipped === text) {
			logger('Text remains same after flipping', 'verbose');
			return;
		}
		logger('Text flipped successfully', 'verbose');

		// 5. Write back to clipboard
		await clipboardy.write(flipped);

		// 6. Paste back
		logger('Pasting flipped text via xdotool');
		execSync('xdotool key --clearmodifiers ctrl+v');
		logger('Process completed successfully');
	} catch (error) {
		logger(`Error in main process: ${error.message}`, 'error');
		if (error.stack) {
			logger(error.stack, 'error');
		}
	}
}

main();
