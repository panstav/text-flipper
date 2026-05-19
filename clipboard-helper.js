module.exports = { getClipboardy };

async function getClipboardy() {
	return (await import('clipboardy')).default;
}
