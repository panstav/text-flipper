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
	const originalSessionType = process.env.XDG_SESSION_TYPE;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	afterAll(() => {
		process.env.XDG_SESSION_TYPE = originalSessionType;
	});

	test('should stash clipboard, flip selected text, paste with ydotool on Wayland, and restore clipboard', async () => {
		process.env.XDG_SESSION_TYPE = 'wayland';
		mockRead
			.mockResolvedValueOnce(ORIGINAL_TEXT)
			.mockResolvedValueOnce(SELECTED_TEXT);

		mockWrite.mockResolvedValue();

		require('../flip');

		// Wait for async main() to resolve
		await new Promise(resolve => setTimeout(resolve, 600));

		const childProcess = require('child_process');

		// Verify ydotool execSync calls
		expect(childProcess.execSync).toHaveBeenCalledWith(
			'ydotool key 29:0 56:0 100:0 29:1 46:1 46:0 29:0',
			{ stdio: 'ignore' }
		);
		expect(childProcess.execSync).toHaveBeenCalledWith(
			'ydotool key 29:0 56:0 100:0 29:1 47:1 47:0 29:0',
			{ stdio: 'ignore' }
		);

		// Verify clipboardy calls
		expect(mockWrite).toHaveBeenCalledWith(FLIPPED_TEXT);
		expect(mockWrite).toHaveBeenCalledWith(ORIGINAL_TEXT);
	});

	test('should fallback to xdotool on non-Wayland sessions', async () => {
		process.env.XDG_SESSION_TYPE = 'x11';
		mockRead
			.mockResolvedValueOnce(ORIGINAL_TEXT)
			.mockResolvedValueOnce(SELECTED_TEXT);

		mockWrite.mockResolvedValue();

		require('../flip');

		await new Promise(resolve => setTimeout(resolve, 600));

		const childProcess = require('child_process');

		expect(childProcess.execSync).toHaveBeenCalledWith(
			'xdotool key --clearmodifiers ctrl+c',
			{ stdio: 'ignore' }
		);
		expect(childProcess.execSync).toHaveBeenCalledWith(
			'xdotool key --clearmodifiers ctrl+v',
			{ stdio: 'ignore' }
		);
	});
});
