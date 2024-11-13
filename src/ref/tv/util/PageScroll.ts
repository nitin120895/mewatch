import { transformString } from 'ref/tv/util/focusUtil';

/**
 * Utility Class which animates page scroll
 */

interface Options {
	element: HTMLElement[] | HTMLElement;
	duration: number;
}

export default class PageScroll {
	duration: number;
	element: HTMLElement[];

	constructor({ element, duration }: Options) {
		this.element = Array.isArray(element) ? element : [element];
		this.duration = duration;
	}

	public scrollTo(endPos) {
		this.element.forEach(ele => {
			ele.setAttribute('style', transformString(-endPos + 'px', this.duration, 0, true));
		});
	}
}
