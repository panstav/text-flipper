const ORIGINAL_TEXT = 'my original clipboard';
const SELECTED_TEXT = 'akuo';
const FLIPPED_TEXT = 'שלום';

const mockRead = jest.fn();
const mockWrite = jest.fn();
const mockLogger = jest.fn();

jest.mock('child_process', () => ({
	execSync: jest.fn()
}));

jest.mock('../clipboard-helper', () => ({
	getClipboardy: jest.fn().mockResolvedValue({
		read: mockRead,
		write: mockWrite
	})
}));

jest.mock('../index', () => {
	const { flipText } = jest.requireActual('../index');
	return {
		flipText,
		logger: (msg, lvl) => mockLogger(msg, lvl)
	};
});

describe('flip.js Main Execution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	test('should stash clipboard, flip selected text, paste, and restore original clipboard', async () => {
		mockRead
			.mockResolvedValueOnce(ORIGINAL_TEXT)
			.mockResolvedValueOnce(SELECTED_TEXT);

		mockWrite.mockResolvedValue();

		require('../flip');

		// Wait for async main() to resolve
		await new Promise(resolve => setTimeout(resolve, 500));

		// Get the active mocked child_process
		const childProcess = require('child_process');

		// Verify execSync calls
		expect(childProcess.execSync).toHaveBeenNthCalledWith(1, 'xdotool key --clearmodifiers ctrl+c');
		expect(childProcess.execSync).toHaveBeenNthCalledWith(2, 'xdotool key --clearmodifiers ctrl+v');

		// Verify clipboardy calls
		expect(mockWrite).toHaveBeenNthCalledWith(1, FLIPPED_TEXT);
		expect(mockWrite).toHaveBeenNthCalledWith(2, ORIGINAL_TEXT);
	});
});
