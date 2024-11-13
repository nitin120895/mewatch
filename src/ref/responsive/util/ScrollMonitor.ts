import { throttle } from 'shared/util/performance';

type ListenerFunction = () => void;

/**
 * Triggers an event when scrolling to end of given element.
 */
export default class ScrollMonitor {
	/**
	 * The distance from the bottom before triggering a load event.
	 *
	 * Defaults to 900.
	 *
	 * This larger number aims to trigger a load event before
	 * the user sees the spinner when scrolling at a slower rate.
	 */
	toleranceMargin = 900;

	private registry = new Set<ListenerFunction>();
	private element: HTMLElement;
	private onScrollThrottled: (e?: UIEvent) => void;

	constructor(element: HTMLElement) {
		this.element = element;
		this.onScrollThrottled = throttle(this.onPositionCheck, 250, true);
	}

	/**
	 * Subscribe to event
	 * @param {function} fn - The function to fire
	 */
	subscribe(fn: ListenerFunction) {
		this.registry.add(fn);
		if (this.registry.size === 1) this.addScrollListener();
	}

	/**
	 * unsubscribe from event
	 * @param {function} fn - The function to remove
	 */
	unsubscribe(fn: ListenerFunction) {
		if (this.registry.has(fn)) this.registry.delete(fn);
		if (this.registry.size === 0) this.removeScrollListener();
	}

	private onPositionCheck = () => {
		if (this.bottomOffset - this.scrollBottom < this.toleranceMargin) {
			this.publish();
		}
	};

	/**
	 * Publish the event and fire all subscribed functions
	 */
	private publish() {
		this.registry.forEach(fn => fn());
	}

	/**
	 * Get the bottom of the provided element
	 */
	private get bottomOffset() {
		return (
			this.element.getBoundingClientRect().top - document.body.getBoundingClientRect().top + this.element.offsetHeight
		);
	}

	/**
	 * The the bottom of the scroll position
	 */
	private get scrollBottom() {
		return (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
	}

	private removeScrollListener() {
		window.removeEventListener('scroll', this.onScrollThrottled);
	}

	private addScrollListener() {
		window.addEventListener('scroll', this.onScrollThrottled, false);
	}
}
