const fs = require('fs');
const path = require('path');

// const LOG_LEVEL = 'verbose';
const LOG_LEVEL = 'errors';

const EN_TO_HE = {
	'q': '/', 'w': "'", 'e': 'ק', 'r': 'ר', 't': 'א', 'y': 'ט', 'u': 'ו', 'i': 'ן', 'o': 'ם', 'p': 'פ', '[': ']', ']': '[',
	'a': 'ש', 's': 'ד', 'd': 'ג', 'f': 'כ', 'g': 'ע', 'h': 'י', 'j': 'ח', 'k': 'ל', 'l': 'ך', ';': 'ף', "'": ',',
	'z': 'ז', 'x': 'ס', 'c': 'ב', 'v': 'ה', 'b': 'נ', 'n': 'מ', 'm': 'צ', ',': 'ת', '.': 'ץ', '/': '.', '`': ';',
	'Q': '/', 'W': "'", 'E': 'ק', 'R': 'ר', 'T': 'א', 'Y': 'ט', 'U': 'ו', 'I': 'ן', 'O': 'ם', 'P': 'פ', '{': ']', '}': '[',
	'A': 'ש', 'S': 'ד', 'D': 'ג', 'F': 'כ', 'G': 'ע', 'H': 'י', 'J': 'ח', 'K': 'ל', 'L': 'ך', ':': 'ף', '"': ',',
	'Z': 'ז', 'X': 'ס', 'C': 'ב', 'V': 'ה', 'B': 'נ', 'N': 'מ', 'M': 'צ', '<': 'ת', '>': 'ץ', '?': '.', '~': ';',
	'(': ')', ')': '('
};

const HE_TO_EN = {
	'/': 'q', "'": 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p', ']': '[', '[': ']',
	'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l', 'ף': ';', ',': "'",
	'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm', 'ת': ',', 'ץ': '.', '.': '/', ';': '`',
	'(': ')', ')': '('
};

/**
 * Flips text between English and Hebrew layouts.
 * @param {string} text - The text to flip.
 * @returns {string} The flipped text.
 */
function flipText(text) {
	if (!text) return text;

	const isHebrew = detectHebrew(text);
	const mapping = isHebrew ? HE_TO_EN : EN_TO_HE;

	return text.split('').map(char => mapping[char] || char).join('');
}

module.exports = { flipText, logger, LOG_LEVEL };

function detectHebrew(text) {
	let hebrewCount = 0;
	let totalCount = 0;

	for (const char of text) {
		if (char.match(/\s/)) continue;
		totalCount++;
		if (char >= '\u0590' && char <= '\u05FF') {
			hebrewCount++;
		}
	}

	if (totalCount === 0) return false;
	return (hebrewCount / totalCount) >= 0.5;
}

function logger(message, level = 'verbose') {
	if (LOG_LEVEL === 'errors' && level === 'verbose') return;

	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

	try {
		fs.appendFileSync(path.join(__dirname, 'log.txt'), logMessage);
	} catch (err) {
		console.error('Failed to write to log file:', err);
	}
}
