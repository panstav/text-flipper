const { flipText } = require('../index');

describe('flipText Logic', () => {
	test('should flip English to Hebrew', () => {
		expect(flipText('akuo')).toBe('שלום');
		expect(flipText('vbc')).toBe('הנב');
		expect(flipText('gftv')).toBe('עכאה');
	});

	test('should flip Hebrew to English', () => {
		expect(flipText('שלום')).toBe('akuo');
		expect(flipText('הנב')).toBe('vbc');
		expect(flipText('עכאה')).toBe('gftv');
	});

	test('should handle uppercase English by mapping to same Hebrew char', () => {
		expect(flipText('AKUO')).toBe('שלום');
		expect(flipText('VBC')).toBe('הנב');
	});

	test('should handle symbols correctly', () => {
		// English to Hebrew symbols
		expect(flipText('q')).toBe('/');
		expect(flipText('`')).toBe(';');
		expect(flipText("'")).toBe(',');
		expect(flipText('[')).toBe(']');
		expect(flipText(']')).toBe('[');

		// Hebrew to English symbols (using Hebrew char to trigger detection)
		expect(flipText('א.')).toBe('t/');
		expect(flipText('א;')).toBe('t`');
		expect(flipText('א,')).toBe("t'");
	});

	test('should handle shifted symbols', () => {
		expect(flipText('?')).toBe('.');
		expect(flipText('>')).toBe('ץ');
		expect(flipText('<')).toBe('ת');
		expect(flipText(':')).toBe('ף');
		expect(flipText('"')).toBe(',');
	});

	test('should swap parentheses', () => {
		expect(flipText('()')).toBe(')(');
	});

	test('should detect language by majority', () => {
		// "hello world" is all English -> Hebrew
		// h=י, e=ק, l=ך, o=ם, w=', r=ר, d=ג
		expect(flipText('hello world')).toBe("יקךךם 'םרךג");

		// "שלום עולם" is all Hebrew -> English
		expect(flipText('שלום עולם')).toBe('akuo guko');

		// Mixed text - mostly English
		expect(flipText('hello שלום')).toBe('יקךךם שלום');

		// Mixed text - mostly Hebrew
		expect(flipText('שלום עולם hello')).toBe('akuo guko hello');
	});

	test('should handle empty or null input', () => {
		expect(flipText('')).toBe('');
		expect(flipText(null)).toBe(null);
	});

	test('should preserve characters without mapping', () => {
		expect(flipText('1234567890!@#$%^&*')).toBe('1234567890!@#$%^&*');
	});
});
