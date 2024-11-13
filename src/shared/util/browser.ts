import { hasBodyClass, addBodyClass } from 'toggle/responsive/util/cssUtil';
import { get } from './objects';
/**
 * Whether Passive Events are supported within the browser.
 *
 * @see https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */
let passiveEvents = false;
let passiveEventsChecked = false;

// Feature Detection: Passive Events
export function supportsPassiveEvents(): boolean {
	if (typeof window === 'undefined') return false;
	if (passiveEventsChecked) return passiveEvents;
	try {
		const opts = Object.defineProperty({}, 'passive', {
			get: function() {
				passiveEvents = true;
			}
		});
		window.addEventListener('test', undefined, opts);
		passiveEventsChecked = true;
	} catch (e) {}
	return passiveEvents;
}

export function addOnceEventListener<E extends Event>(
	target: EventTarget,
	eventName: string,
	handler: (event: E) => void,
	options?: boolean | AddEventListenerOptions
) {
	function eventListener(event: E) {
		handler(event);
		target.removeEventListener(eventName, eventListener, options);
	}

	target.addEventListener(eventName, eventListener, options);
}

export function promiseFromEvent<E extends Event>(
	target: EventTarget,
	eventName: string,
	options?: boolean | AddEventListenerOptions
) {
	return new Promise((resolve, reject) => {
		addOnceEventListener<E>(target, eventName, resolve);
		addOnceEventListener<E>(target, 'error', reject);
	});
}

/**
 * Repeatedly search the dom for an element with a specific id using `getElementById` (efficient).
 *
 * If found executes a callback with the element.
 *
 * If not found, or `maxAttempts` are reached, executes the callback with undefined.
 *
 * Each search is 50ms apart by default.
 *
 * @param id the id of the element to search for
 * @param callback the callback to be passed the element, or undefined if not found
 * @param maxAttempts the max number of attempts to make locating the element, defaults to 25.
 * @param delayMs the delay between search attempts, defaults to 50ms
 * @return a function which can be called to cancel the search
 */
export function findElementWithId(id, callback, maxAttempts = 25, delayMs = 50): () => void {
	if (typeof window === 'undefined') {
		callback();
		return () => {};
	}

	const options = { timeoutId: 0, id, maxAttempts, delayMs, attempts: 0 };
	findElement(callback, options);
	return () => clearTimeout(options.timeoutId);
}

function findElement(callback, opt) {
	const firstPageRow = document.getElementById(opt.id);
	if (!firstPageRow && opt.attempts++ < opt.maxAttempts) {
		opt.timeoutId = setTimeout(() => findElement(callback, opt), opt.delayMs);
	} else {
		callback(firstPageRow);
	}
}

const MAX_ATTEMPTS = 50;
let timeoutId;
let firstRestore = true;

/**
 * Attempt to restore a previous scroll position.
 *
 * @param scrollY the scroll y position to restore to
 */
export function restoreScrollPosition(scrollY: number, attempts = 0) {
	if (typeof window === 'undefined') return;

	// When we first attempt to restore a scroll position the current scroll y
	// should be 0. If not then assume the user has scrolled and abort the restore
	if (firstRestore) {
		firstRestore = false;
		if (window.pageYOffset !== 0) return;
	}

	clearTimeout(timeoutId);
	if (attempts > MAX_ATTEMPTS) return;

	// Calculate if we can scroll to our target otherwise we could end
	// up scrolling part of the way down the page, and then scrolling again
	// a second later, which looks bad
	const maxY = document.documentElement.scrollHeight - document.documentElement.clientHeight;
	if (scrollY <= maxY) {
		window.scrollTo(0, scrollY);
	}

	// If we're still at scroll 0 then retry, if not then
	// user must have scrolled while waiting so abort restore
	if (window.pageYOffset !== scrollY) {
		timeoutId = setTimeout(() => restoreScrollPosition(scrollY, ++attempts), 40);
	}
}

// A query string which will select for all focusable element children within a parent element.
// Currently includes tabIndex=-1 elements.
const FocusableElementsString =
	'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]';

/**
 * Gets all focusable elements within a given container element
 *
 * @param container The parent element to search under to find focusable element children
 * @return array of focusbale elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
	if (!container) undefined;
	return Array.from(container.querySelectorAll(FocusableElementsString)).filter(
		element => element.attributes['tabIndex'] !== -1
	) as HTMLElement[];
}

/**
 * Function to get the first focusable element from container
 *
 * @param container The parent element to search under to find focusable element children
 * @return the first focusable element within the container, or undefined if none found
 */
export function getFirstFocusableElement(container: HTMLElement): HTMLElement | undefined {
	return container ? getFocusableElements(container)[0] : undefined;
}

/**
 * Function to get the last focusable element from container
 *
 * @param container The parent element to search under to find focusable element children
 * @return the last focusable element within the container, or undefined if none found
 */
export function getLastFocusableElement(container: HTMLElement): HTMLElement | undefined {
	return container ? getFocusableElements(container).pop() : undefined;
}

export function isTouch() {
	return 'ontouchstart' in window;
}

/**
 * Check to see if running on an iOS device e.g. iPad, iPhone or iPod.
 *
 * This check should _only_ be used post initial render. Using it to conditionally
 * display components during the first render can lead to inconsistencies with the
 * server side render.
 */
export function isIOS() {
	if (typeof window === 'undefined') return false;
	return (
		(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream']) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && isTouch())
	);
}

export function isClearKeyContentBrowser() {
	if (typeof window === 'undefined') return false;

	return (
		// Chrome iOS
		navigator.userAgent.toLowerCase().match('crios') ||
		// Firefox iOS
		navigator.userAgent.toLowerCase().match('fxios') ||
		// Samsung Browser
		navigator.userAgent.toLowerCase().match('samsungbrowser') ||
		// Firefox Android
		(isAndroid() && navigator.userAgent.toLowerCase().match('firefox'))
	);
}

/**
 * Check to see if running on an Safari browser
 *
 * This check should _only_ be used post initial render. Using it to conditionally
 * display components during the first render can lead to inconsistencies with the
 * server side render.
 */
export function isSafari() {
	if (typeof window === 'undefined') return false;
	return navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
}

/**
 * Check to see if running on an Android device
 *
 * This check should _only_ be used post initial render. Using it to conditionally
 * display components during the first render can lead to inconsistencies with the
 * server side render.
 */
export function isAndroid() {
	if (typeof window === 'undefined') return false;
	return /Android/.test(navigator.userAgent) && !window['MSStream'];
}

/**
 * Check to see if running on an Windows mobile device
 *
 * This check should _only_ be used post initial render. Using it to conditionally
 * display components during the first render can lead to inconsistencies with the
 * server side render.
 */
export function isWindowsMobile() {
	if (typeof window === 'undefined') return false;
	return /IEMobile/.test(navigator.userAgent) && !window['MSStream'];
}

/**
 * Check to see if running on an Opera mini device
 *
 * This check should _only_ be used post initial render. Using it to conditionally
 * display components during the first render can lead to inconsistencies with the
 * server side render.
 */
export function isOperaMini() {
	if (typeof window === 'undefined') return false;
	return /Opera Mini/.test(navigator.userAgent) && !window['MSStream'];
}

/**
 * Check to see if running on an BlackBerry device
 *
 * This check should _only_ be used post initial render. Using it to conditionally
 * display components during the first render can lead to inconsistencies with the
 * server side render.
 */
export function isBlackBerry() {
	if (typeof window === 'undefined') return false;
	return /BlackBerry/.test(navigator.userAgent) && !window['MSStream'];
}

const isNavigator = typeof navigator !== 'undefined';

export function isChrome() {
	return isNavigator && /Chrome/i.test(navigator.userAgent) && /Google/i.test(navigator.vendor);
}

export function isChromeIOS() {
	return isNavigator && /CriOS/.test(navigator.userAgent);
}

export function isEdge() {
	return isNavigator && /Edg/i.test(navigator.userAgent);
}

export function isOpera() {
	return isNavigator && /OPR/i.test(navigator.userAgent);
}

export function isFirefox() {
	return isNavigator && /Firefox/i.test(navigator.userAgent);
}

export function isBrave() {
	return isNavigator && typeof get(navigator, 'brave.isBrave') !== 'undefined';
}

export function isUnsupportedBrowser() {
	return isIE11() || isOpera();
}

const userAgent = isNavigator && get(window, 'navigator.userAgent') && get(window, 'navigator.userAgent').toLowerCase();

export function getOSName() {
	if (userAgent) {
		if (userAgent.includes('windows') || userAgent.includes('win32')) return 'Windows';
		if (userAgent.includes('macintosh')) return 'MacOS';
		if (userAgent.includes('android')) return 'Android';
		if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
		if (userAgent.includes('linux')) return 'Linux';
	}
	return 'Unknown';
}

export function getBrowserName() {
	if (userAgent) {
		if (userAgent.includes('chrome')) {
			if (userAgent.includes('edg')) return 'Edge';
			else if (userAgent.includes('opr')) return 'Opera';
			else return 'Chrome';
		}
		if (isFirefox()) return 'Firefox';
		if (userAgent.includes('safari')) return 'Safari';
	}

	return 'Web browser';
}

export function isMobile() {
	return isIOS() || isAndroid() || isWindowsMobile() || isOperaMini() || isBlackBerry();
}

export function isIE11() {
	return isNavigator && /Trident/i.test(navigator.userAgent);
}

/*
 * Spartan is based on the EdgeHTML rendering engine.
 * https://en.wikipedia.org/wiki/Microsoft_Edge#Spartan_(2014%E2%80%932019)
 * After this version EdgeHTML was replaced with the Chromium rendering engine.
 * This means that there are fewer compatability issues
 *
 */
export function isEdgeSpartan() {
	if (!isNavigator) return false;

	const test = /Edge?\/([\d.]+)$/;
	const result = navigator.userAgent.match(test);

	if (!result) return false;

	const [edgeString, version] = result;

	if (!edgeString) return false;

	const lastSpartanVersion = 18;
	if (version && parseInt(version) <= lastSpartanVersion) return true;

	return false;
}

export enum DeviceResolution {
	MOBILE = 'mobile',
	TABLET = 'tablet',
	DESKTOP = 'desktop'
}

/**
 *  Check if ⌘(Command) or ⊞(Windows) key is pressed
 */
export function isMetaKeyPressed(event) {
	return event.metaKey;
}

/**
 *  To allow combination like ⌘+A, ⌘+C, ⌘+X, ⌘+V, etc only in Safari
 */
export function isSafariAndCommandKeyPressed(event) {
	// event.keyCode is permanently return 0 in Safari on keypress event and I didn't find a way how effectively filter key combos
	return isSafari() && isMetaKeyPressed(event);
}

/**
 *  Identify if the user's device supports touch interaction
 */
interface Touchable extends Window {
	IS_TOUCH_DEVICE: boolean;
}

export function checkIsTouchDevice() {
	if (typeof window === 'undefined') return;
	const isTouchClass = 'is-touch-device';

	if (isTouch() && !hasBodyClass(isTouchClass)) {
		addBodyClass(isTouchClass);
		(window as Touchable).IS_TOUCH_DEVICE = true;
	}
}

export function isElementHidden(el: HTMLElement): boolean {
	return el.offsetParent === null;
}

/**
 *  Identify if the user's device is on the MAC platform
 */
export function isMac() {
	return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// Secondary Solution - https://www.radiantmediaplayer.com/blog/detecting-eme-cdm-browser.html
export const hasEMESupport = function(): boolean {
	return 'MediaKeys' in window || 'WebKitMediaKeys' in window || 'MSMediaKeys' in window;
};

export const hasRMKSASupport = function(): boolean {
	return 'requestMediaKeySystemAccess' in window.navigator;
};

// Primary Solution - Adaptation of - https://stackoverflow.com/questions/35086625/determine-drm-system-supported-by-browser

export const getSupportedEncryptedMediaExtensions = async function(): Promise<Array<Object>> {
	if (hasEMESupport() && hasRMKSASupport()) {
		let supportedSystems = [];
		const testVideoElement = document.createElement('video') as HTMLVideoElement;

		enum KEY_SYSTEMS {
			WIDEVINE = 'com.widevine.alpha',
			FAIRPLAY = 'com.apple.fairplay',
			MICROSOFT_PLAYREADY_REC = 'com.microsoft.playready.recommendation',
			YOUTUBE_PLAYREADY = 'com.youtube.playready',
			MICROSOFT_PLAYREADY = 'com.microsoft.playready'

			// Placeholders if extension needed

			// WEBKIT_CLEARKEY = 'webkit-org.w3.clearkey',
			// CLEARKEY = 'org.w3.clearkey',
			// ADOBE_PRIMETIME = 'com.adobe.primetime',
			// ADOBE_ACCESS = 'com.adobe.access'
		}

		enum WIDEVINE_SECURITY_LEVELS {
			// Note: order of items important from highest clearance to lowest
			// WIDEVINE + GENERAL SECURITY LEVELS
			HW_SECURE_ALL = 'HW_SECURE_ALL',
			HW_SECURE_DECODE = 'HW_SECURE_DECODE',
			HW_SECURE_CRYPTO = 'HW_SECURE_CRYPTO',
			SW_SECURE_DECODE = 'SW_SECURE_DECODE',
			SW_SECURE_CRYPTO = 'SW_SECURE_CRYPTO',
			BLANK = ''
		}

		enum PLAYREADY_SECURITY_LEVELS {
			// Note: order of tems important from highest clearance to lowest
			SL3000 = '3000',
			SL2000 = '2000'
		}

		enum GENERAL_SECURITY_LEVELS {
			BLANK = ''
		}

		enum CONTENT_TYPES {
			AUDIO = 'audio/mp4;codecs="mp4a.40.2"',
			VIDEO = 'video/mp4;codecs="avc1.42E01E"',
			PR_AUDIO = 'audio/mp4; codecs="mp4a"',
			PR_VIDEO = 'video/mp4; codecs="avc1"'
		}

		let standardConfig = (setting: string) => [
			{
				initDataTypes: ['cenc'],
				audioCapabilities: [
					{
						robustness: `${setting}`,
						contentType: CONTENT_TYPES.AUDIO
					}
				],
				videoCapabilities: [
					{
						robustness: `${setting}`,
						contentType: CONTENT_TYPES.VIDEO
					}
				]
			}
		];

		let playreadyConfig = (setting: string) => [
			{
				initDataTypes: ['cenc'],
				audioCapabilities: [
					{
						contentType: CONTENT_TYPES.PR_AUDIO
					}
				],
				videoCapabilities: [
					{
						robustness: `${setting}`,
						contentType: CONTENT_TYPES.PR_VIDEO
					}
				],
				distinctiveIdentifier: 'required',
				persistentState: 'required'
			}
		];

		const mediaKeySystemCheck = async (keySystem, securityLevel, playready = false) => {
			let configuration;

			if (playready) {
				configuration = playreadyConfig(securityLevel);
			} else {
				configuration = standardConfig(securityLevel);
			}

			try {
				const res = await navigator.requestMediaKeySystemAccess(keySystem, configuration);
				supportedSystems = [...supportedSystems, { type: res.keySystem, level: securityLevel }];
			} catch (e) {}
			// Catch Intentionally Blank as don't need to collect unsupported systems
		};

		if (!testVideoElement.mediaKeys) {
			if (window.navigator.requestMediaKeySystemAccess) {
				let keysys, level, playreadyLevels;
				// Loop 1 - All KeySystems
				for (keysys in KEY_SYSTEMS) {
					if (KEY_SYSTEMS[keysys] === KEY_SYSTEMS.WIDEVINE) {
						// Loop 2 - Each security level : 'Level 1'
						for (level in WIDEVINE_SECURITY_LEVELS) {
							await mediaKeySystemCheck(KEY_SYSTEMS.WIDEVINE, WIDEVINE_SECURITY_LEVELS[level]);
						}
					} else if (KEY_SYSTEMS[keysys] === KEY_SYSTEMS.MICROSOFT_PLAYREADY_REC) {
						// Loop 2 - Each security level for playready system
						for (playreadyLevels in PLAYREADY_SECURITY_LEVELS) {
							await mediaKeySystemCheck(KEY_SYSTEMS.WIDEVINE, PLAYREADY_SECURITY_LEVELS[playreadyLevels], true);
						}
					} else {
						// Single check
						await mediaKeySystemCheck(KEY_SYSTEMS[keysys], GENERAL_SECURITY_LEVELS.BLANK);
					}
				}
			} else if (window.MSMediaKeys) {
				let keysys;
				for (keysys in KEY_SYSTEMS) {
					const VideoSupported = MSMediaKeys.isTypeSupported(KEY_SYSTEMS[keysys], CONTENT_TYPES.VIDEO);
					const AudioSupported = MSMediaKeys.isTypeSupported(KEY_SYSTEMS[keysys], CONTENT_TYPES.AUDIO);
					if (VideoSupported && AudioSupported) {
						supportedSystems.push({ type: KEY_SYSTEMS[keysys], level: '' });
					}
				}
			}
		}
		return supportedSystems;
	} else {
		// No EME or RMKASUPPORT Found
		return [];
	}
};
