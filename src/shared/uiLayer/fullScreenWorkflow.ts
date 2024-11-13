import { hasBodyClass, addBodyClass, removeBodyClass } from 'toggle/responsive/util/cssUtil';
import { isSafari } from 'shared/util/browser';

// PAGE_RELOAD_DELAY covers most cases when we need to switch fullscreen after page reload
// Works in Chrome and might cause errors due to browser's restrictions in other browsers
const PAGE_RELOAD_DELAY = 1000;

interface FullScreenDocument extends Document {
	fullscreenElement: HTMLElement;
	webkitFullscreenElement: HTMLElement;
	mozFullScreenElement?: HTMLElement;
	msFullscreenElement?: HTMLElement;
	webkitCurrentFullScreenElement?: HTMLElement;
	webkitExitFullscreen: () => Promise<void>;
	mozCancelFullScreen: () => Promise<void>;
	msExitFullscreen: () => Promise<void>;
}
export interface FullScreenElement extends HTMLVideoElement {
	webkitRequestFullscreen: () => void;
	webkitEnterFullscreen: () => void;
	mozRequestFullScreen?: () => void;
	msRequestFullscreen?: () => void;
	exitFullscreen?: () => void;
	webkitExitFullscreen: () => void;
	mozCancelFullScreen?: () => void;
	msExitFullscreen?: () => void;
}
interface IFullScreenWorkflow {
	init(): void;
	dispose(): void;
	changeFullscreen(): void;
	switchOnFullscreen(): void;
	switchOffFullscreen(): void;
	forceSwitchOffFullscreen(): void;
	setFullScreenElement: (element: FullScreenElement) => void;
	isFakeFullscreen: () => boolean;
	isFullScreen: () => boolean;
	setCallback: (callback: Function) => void;
	removeCallback: (callback: Function) => void;
	usePageReloadDelay: (withDelay: boolean) => void;
}

class FullScreenWorkflow implements IFullScreenWorkflow {
	private NATIVE_FULLSCREEN_CLASS = 'native-fullscreen';
	private FAKE_FULLSCREEN_CLASS = 'fake-fullscreen';
	private FULLSCREEN_CLASS = 'is-fullscreen';
	private callbacks: Function[] = [];
	private element: FullScreenElement;
	private fullscreen: boolean;
	public withPageReloadDelay: boolean;

	public init() {
		this.initializeEventListeners();

		if (_DEV_) window['FullScreenService'] = this;
	}

	public dispose() {
		this.destroyEventListeners();
	}

	public setFullScreenElement(element): void {
		this.element = element;
		this.fullscreen = this.isFullScreen();
	}

	public setCallback = (callback: Function): void => {
		this.callbacks.push(callback);
	};

	public removeCallback = (callback: Function): void => {
		this.callbacks = this.callbacks.filter(cb => cb !== callback);
	};

	public usePageReloadDelay = (withDelay: boolean): void => {
		this.withPageReloadDelay = withDelay;
	};

	public isFullScreen = (): boolean => this.isNativeFullscreen() || this.isFakeFullscreen();

	public changeFullscreen(): void {
		const skipFakeFullscreenToggling = this.withPageReloadDelay;

		if (this.shouldUseFakeFullscreenMode()) {
			if (skipFakeFullscreenToggling) return; // we don't disable fake fullscreen mode on route changing
			this.onFullScreenChange();
		} else {
			if (this.withPageReloadDelay) {
				this.delayFullscreenChange();
			} else {
				this.toggleNativeFullscreen();
			}
		}
	}

	public switchOnFullscreen(): void {
		if (this.isFullScreen()) return;
		this.changeFullscreen();
	}

	public switchOffFullscreen(): void {
		if (!this.isFullScreen()) return;
		this.changeFullscreen();
	}

	public forceSwitchOffFullscreen() {
		this.exitFullscreen(this.element);
	}

	public isFakeFullscreen(): boolean {
		if (typeof window === 'undefined' || !this.shouldUseFakeFullscreenMode()) return false;
		return hasBodyClass(this.FAKE_FULLSCREEN_CLASS);
	}

	private initializeEventListeners() {
		document.addEventListener('fullscreenchange', this.onFullScreenChange, false);
		document.addEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
		document.addEventListener('mozfullscreenchange', this.onFullScreenChange, false);
		document.addEventListener('msfullscreenchange', this.onFullScreenChange, false);
		document.addEventListener('fullscreenerror', this.onFullScreenError, false);
	}

	private destroyEventListeners() {
		document.removeEventListener('fullscreenchange', this.onFullScreenChange, false);
		document.removeEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
		document.removeEventListener('mozfullscreenchange', this.onFullScreenChange, false);
		document.removeEventListener('msfullscreenchange', this.onFullScreenChange, false);
		document.removeEventListener('fullscreenerror', this.onFullScreenError, false);
	}

	private getFullscreenModeClass = (): string =>
		this.shouldUseFakeFullscreenMode() ? this.FAKE_FULLSCREEN_CLASS : this.NATIVE_FULLSCREEN_CLASS;

	private toggleFullscreenState = (): void => {
		this.fullscreen = !this.fullscreen;
	};

	private toggleBodyClass = (): void => {
		const fullscreenModeClass = this.getFullscreenModeClass();
		const nextFakeFullscreenState = this.shouldUseFakeFullscreenMode() && this.fullscreen;
		if (this.isNativeFullscreen() || nextFakeFullscreenState) {
			addBodyClass(fullscreenModeClass);
			addBodyClass(this.FULLSCREEN_CLASS);
		} else {
			removeBodyClass(fullscreenModeClass);
			removeBodyClass(this.FULLSCREEN_CLASS);
		}
	};

	private toggleNativeFullscreen(): void {
		if (!this.fullscreen || !this.isFullScreen()) {
			this.requestFullscreen(this.element);
		} else {
			this.exitFullscreen(this.element);
		}
	}

	private onFullScreenChange = (): void => {
		this.toggleFullscreenState();
		this.toggleBodyClass();
		this.dispatchCallbacks();
		// sync browser real fullscreen state
		setTimeout(this.syncNativeFullscreenState);
	};

	private onFullScreenError = (): void => {
		this.syncNativeFullscreenState();
	};

	private isNativeFullscreen(): boolean {
		if (typeof window === 'undefined') return false;
		const doc = document as FullScreenDocument;
		return (
			!!doc.fullscreenElement /* Standard syntax */ ||
			!!doc.webkitFullscreenElement /* Chrome, Safari and Opera syntax */ ||
			!!doc.mozFullScreenElement /* Firefox syntax */ ||
			!!doc.msFullscreenElement /* IE/Edge syntax */ ||
			!!doc.webkitCurrentFullScreenElement /* Safari syntax */
		);
	}

	private exitFullscreen(element?: FullScreenElement | HTMLElement): void {
		const elm = element as FullScreenElement;
		const doc = document as FullScreenDocument;

		if (!elm) return;

		if (elm.exitFullscreen) {
			elm.exitFullscreen();
		} else if (elm.webkitExitFullscreen) {
			doc.webkitExitFullscreen();
		} else if (elm.mozCancelFullScreen) {
			elm.mozCancelFullScreen();
		} else if (elm.msExitFullscreen) {
			elm.msExitFullscreen();
		} else if (doc.exitFullscreen) {
			doc.exitFullscreen();
			// modern safari doesn't fire any
			// of the known fullscreen event triggers
			isSafari() && this.onFullScreenChange();
		} else if (doc.webkitExitFullscreen) {
			doc.webkitExitFullscreen();
		} else if (doc.mozCancelFullScreen) {
			doc.mozCancelFullScreen();
		} else if (doc.msExitFullscreen) {
			doc.msExitFullscreen();
		}
	}

	private requestFullscreen(element: FullScreenElement | HTMLElement): void {
		try {
			const elm = element as FullScreenElement;
			if (elm.requestFullscreen) {
				elm
					.requestFullscreen()
					.then(() => {
						// modern safari doesn't fire any
						// of the known fullscreen event triggers
						isSafari() && this.onFullScreenChange();
					})
					.catch(e => console.log('Failed to requestFullscreen', e));
			} else if (elm.webkitRequestFullscreen) {
				// Safari, old chrome
				elm.webkitRequestFullscreen();
			} else if (elm.webkitEnterFullscreen) {
				// iOS
				elm.webkitEnterFullscreen();
			} else if (elm.mozRequestFullScreen) {
				// firefox
				elm.mozRequestFullScreen();
			} else if (elm.msRequestFullscreen) {
				// IE, Edge
				elm.msRequestFullscreen();
			}
		} catch (e) {
			console.log('Failed to requestFullscreen', e);
		}
	}

	private isNativeFullsceenSupported(): boolean {
		const elm = this.element || (document.body as FullScreenElement);
		return !!(
			elm.requestFullscreen ||
			elm.webkitRequestFullscreen ||
			elm.webkitEnterFullscreen ||
			elm.mozRequestFullScreen ||
			elm.msRequestFullscreen
		);
	}

	private syncNativeFullscreenState = () => {
		if (this.isFakeFullscreen()) return;

		if (this.isNativeFullscreen() !== this.fullscreen) {
			this.onFullScreenChange();
		}
	};

	private delayFullscreenChange = (): NodeJS.Timer =>
		setTimeout(() => {
			this.toggleNativeFullscreen();
		}, PAGE_RELOAD_DELAY);

	private shouldUseFakeFullscreenMode = (): boolean => !this.isNativeFullsceenSupported();

	private dispatchCallbacks(): void {
		if (this.callbacks.length) {
			this.callbacks.map(callback => callback());
		}
	}
}

export const fullscreenService = new FullScreenWorkflow();
