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

export function ellipsisText(element: HTMLElement, text: string): string {
	const innerText = element.innerText;

	if (element.scrollHeight <= element.clientHeight) {
		return text;
	}

	const ellipsisAppdix = '...';
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

	return element.innerText;
}

export function toTimeString(duration: number): string {
	if (!duration) {
		duration = 0;
	}

	const hours = Math.floor(duration / 3600);
	const minutes = Math.floor((duration % 3600) / 60);
	const seconds = Math.floor((duration % 3600) % 60);

	return hours + ':' + (minutes >= 10 ? minutes : '0' + minutes) + ':' + (seconds >= 10 ? seconds : '0' + seconds);
}
