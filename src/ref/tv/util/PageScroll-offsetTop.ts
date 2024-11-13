/**
 * Utility Class which animates page scroll
 */

interface Options {
	element: HTMLElement[] | HTMLElement;
	duration: number;
}

export default class PageScroll {
	private current = 0;
	private animation: number;
	private lastTime: number;
	private startPos = 0;
	private endPos = 0;
	private curScrollPos = 0;
	duration: number;
	element: HTMLElement[];

	static lerp(p1: number, p2: number, t: number): number {
		return p1 + (p2 - p1) * t;
	}

	static easings = {
		easeOut(t) {
			return t * (2 - t);
		},
		easeInOut(t) {
			return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
		}
	};

	constructor({ element, duration }: Options) {
		this.element = Array.isArray(element) ? element : [element];
		this.duration = duration;
	}

	public cancelAnimation = () => {
		if (this.animation) {
			window.cancelAnimationFrame(this.animation);
			this.animation = 0;
			this.current = 0;
		}
	};

	private loop = () => {
		const nowTime = Date.now();
		const dt = nowTime - this.lastTime;
		this.lastTime = nowTime;
		this.current += dt;
		const t = this.current / this.duration;

		if (t >= 1) {
			this.curScrollPos = this.endPos;
			this.cancelAnimation();
			this.element.forEach(ele => {
				ele.parentElement.scrollTop = this.endPos;
			});
		} else {
			this.curScrollPos = parseInt(
				PageScroll.lerp(this.startPos, this.endPos, PageScroll.easings.easeOut(t)).toFixed(2)
			);

			this.element.forEach(ele => (ele.parentElement.scrollTop = this.curScrollPos));

			this.lastTime = Date.now();
			this.animation = window.requestAnimationFrame(this.loop);
		}
	};

	public scrollTo(endPos) {
		this.startPos = this.curScrollPos;

		// Ignore same destination requested multiple times, unless physical scroll is wrong
		if (endPos === this.endPos) {
			if (this.startPos === endPos) {
				const realScrollPos = this.element[0].parentElement.scrollTop;
				if (realScrollPos !== this.startPos) this.startPos = realScrollPos;
			} else {
				return;
			}
		}
		this.endPos = endPos;

		if (this.startPos !== this.endPos) {
			this.cancelAnimation();
			this.lastTime = Date.now();
			this.animation = window.requestAnimationFrame(this.loop);
		}
	}
}
