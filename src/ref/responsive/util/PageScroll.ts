/**
 * Utility Class which animates page scroll
 */

type scrollTypes = 'scrollLeft' | 'scrollTop';

interface Options {
	element: HTMLElement[] | HTMLElement;
	duration: number;
	scrollType: scrollTypes;
}

export default class PageScroll {
	private current = 0;
	private animation: number;
	private startPos: number;
	private endPos: number;
	duration: number;
	element: HTMLElement[] | HTMLElement;
	scrollType: scrollTypes;

	static lerp(p1, p2, t) {
		return p1 + (p2 - p1) * t;
	}

	static easings = {
		easeInOut(t) {
			return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
		}
	};

	constructor({ element, duration, scrollType }: Options) {
		this.element = element;
		this.duration = duration;
		this.scrollType = scrollType;
	}

	public cancelAnimation = () => {
		if (this.animation) {
			window.cancelAnimationFrame(this.animation);
			this.current = 1;
		}
	};

	private loop = () => {
		this.current += 1;
		const t = this.current / this.duration;

		if (t >= 1) {
			this.cancelAnimation();
		} else {
			const scrollPos = PageScroll.lerp(this.endPos, this.startPos, PageScroll.easings['easeInOut'](t)).toFixed(2);

			if (Array.isArray(this.element)) {
				this.element.forEach(ele => {
					ele[this.scrollType] = scrollPos;
				});
			} else {
				this.element[this.scrollType] = scrollPos;
			}

			this.animation = window.requestAnimationFrame(this.loop);
		}
	};

	public scroll(startPos, endPos) {
		this.startPos = startPos;
		this.endPos = endPos;
		this.loop();
	}
}
