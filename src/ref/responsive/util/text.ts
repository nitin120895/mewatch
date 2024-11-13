/**
 * Checks if the given element is longer than given number of lines
 * @param {HTMLElement} An element containing text
 * @param {number} maximum number of lines of text to be displayed
 * @return {boolean} true if the text exceeds the maximum number of lines to be displayed
 */
export function shouldTruncate(element: HTMLElement, displayedLineCount: number): boolean {
	const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
	const lineCount = Math.floor(element.scrollHeight / lineHeight);
	return lineCount >= displayedLineCount;
}

/**
 * Truncate text
 * @param {HTMLElement} An element containing text
 * @param {string} text for element
 * @return {string} end of trunated text
 */
export function truncateText(element: HTMLElement, text: string, ellipsisAppdix = '...'): string {
	const innerText = element.innerText;

	if (element.scrollHeight <= element.clientHeight) {
		return text;
	}

	let tarText = innerText;

	// find nearest index around wrap and unwrap
	let curMin = 0,
		curMax = innerText.length - 1;

	const addHalfStep = () => (curMax - tarText.length) / 2;
	const delHalfStep = () => tarText.length - (tarText.length - curMin) / 2;

	while (curMin < curMax - 1) {
		if (element.scrollHeight > element.clientHeight) {
			// need remove
			curMax = tarText.length - 1;
			tarText = tarText.substr(0, delHalfStep());
		} else {
			// need add
			curMin = tarText.length;
			tarText = tarText + innerText.substr(tarText.length, addHalfStep());
		}

		element.innerText = tarText + ellipsisAppdix;
	}

	// one more step to trim punctuation before allipsis
	element.innerText = trimPunctuation(tarText) + ellipsisAppdix;
	return element.innerText;
}

function trimPunctuation(text: string) {
	if (!text || !text.length) return text;
	while (text.length && PUNCTUATION.indexOf(text[text.length - 1]) >= 0) {
		text = text.slice(0, -1);
	}

	return text;
}

const PUNCTUATION = ['.', ',', ':', ';', '?', '!', '&', "'", '"', '(', ')', '/', '+', '-', '–', '—', ' '];
