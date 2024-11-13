export function genId() {
	return Math.random()
		.toString(36)
		.substr(2, 6);
}

/**
 * Given a string with one or more sentences, truncate the string
 * at the closest sentence which runs over a min character limit.
 *
 * If no limit is defined then truncates to first sentence.
 *
 * @param text the text to truncate
 * @param minChars the minimum number of chars before looking to truncate.
 * 									If undefined truncates after first sentance
 */
export function truncateSentences(text: string, minChars = 0): string {
	if (!text) return text;
	const parts = text.trim().split('.');
	if (parts[parts.length - 1] === '') parts.pop();
	let str = '';
	for (let s of parts) {
		str += `${s}.`;
		if (str.length >= minChars) {
			return str;
		}
	}
	return str;
}

/**
 * Escapes user entered text for use as a literal string within a regular expression.
 *
 * @param text Text which may include characters requiring escaping.
 */
export function sanitizeForRegExp(text: string) {
	// $& means the whole matched string
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * from "Iterating Over Emoji Characters the ES6 Way" under the "So How Do We Iterate Over Unicode Characters?"
 * https://medium.com/@giltayar/iterating-over-emoji-characters-the-es6-way-f06e4589516
 *
 * @param s string
 */
export function getFirstCharacter(str: string) {
	if (str) {
		const iterator = str[Symbol.iterator]();
		return iterator.next().value;
	}

	return '';
}

/**
 * Capitalize the first letter of each word of a given string
 *
 * @param str string
 */
export function capitalizeStr(str: string): string {
	const strArray = str.split(' ');

	for (let i = 0; i < strArray.length; i++) {
		strArray[i] = strArray[i][0].toUpperCase() + strArray[i].slice(1);
	}

	return strArray.join(' ');
}

/**
 * Check if a keyword is within a larger primary string
 *
 * NOTE: Not case sensitive
 *
 * @param primary the "larger" string that will be checked
 * @param keyword the string that will be searched for within the primary string
 */
export function stringContainsKeyword(primary: string, keyword: string) {
	// Normalize both strings as inlcudes function is case sensitive
	const primaryString = primary.toLowerCase();
	const keywordString = keyword.toLowerCase();

	return primaryString.includes(keywordString);
}
