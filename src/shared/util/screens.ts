/**
 * Screen Capabilities
 *
 * Most users have a single monitor/screen. This is especially true for handheld devices
 * and televisions.
 *
 * Unfortunately Javascript doesn't expose a way to know how many screens are available
 * on the user's system, nor when a window is moved between screens. We can only lookup
 * information on the screen housing our app.
 *
 * This class attempts to detect multiple screens and their capabilities whenever the user
 * moves the mouse inside the viewport. This allows us to check whether the window has
 * been moved into a new screen with potentially different capabilities.
 */

// Internal state
const screens = new Map<string, ScreenInfo>();
let isPrimaryScreen = true;
let activeScreen: ScreenInfo;

type ScreenInfo = { width: number; dpr: number; x?: number };

/**
 * The supported device pixel ratios for the screens we're aware of.
 *
 * This may not be the complete list of supported ratios for the system.
 * The app is only aware of screens the browser window has been contained within.
 * This list can grow over time when the app is exposed to additional screens.
 */
export const supportedPixelRatios = [];

/**
 * Whether the window is housed within the primary screen.
 * This will always be true for single screen systems and handheld devices.
 */
function isWithinPrimaryScreen() {
	if (typeof window === 'undefined') return true;
	return window.screenX <= window.screen.width;
}

/**
 * Browsers may return different values for devicePixelRatio on the same system.
 * To maintain optimized CDN caching we round the DPR to the nearest 0.5 and ensure
 * we return 1.0 as a minimum.
 *
 * This is usually done by the browser but not always. e.g. Firefox might return
 * 1.3953487873077393 where as Chrome returns 1.5. or Firefox might return 1.0 and
 * Chrome returns 0.8999999761581421.
 *
 * @return The devicePixelRatio rounded to the nearest 0.5 e.g. 1.0, 1.5, 2.0, 2.5, etc.
 */
function normalisePixelRatio(dpr: number): number {
	if (isNaN(dpr) || dpr < 1) dpr = 1;
	return Math.round(dpr * 2) / 2;
}

/**
 * Determines whether the app is contained within a different screen since we
 * last checked.
 *
 * @return Whether the current screen differs from the stored screen.
 */
function determineScreenCapabilities(event?: any) {
	const primary = isWithinPrimaryScreen();
	// The number of users with more than two screens is low therefore we perform a crude
	// check assuming a maximum of 2 sceens to reduce computational overhead.
	// If you require support for 3 or more screens you could compare `getActiveScreenInfo() !== activeScreen`.
	const changed = primary !== isPrimaryScreen || !activeScreen;
	if (changed) {
		isPrimaryScreen = primary;
		activeScreen = getActiveScreenInfo();
		const dpr = normalisePixelRatio(activeScreen.dpr);
		if (!~supportedPixelRatios.indexOf(dpr)) {
			// Identical screen densities are discarded. The result is sorted numerically.
			supportedPixelRatios.push(dpr);
			if (supportedPixelRatios.length > 1) supportedPixelRatios.sort();
		}
	}
	return changed;
}

/**
 * Returns the active screen's info (width, x position, and DPR).
 */
function getActiveScreenInfo(): ScreenInfo {
	const { screen, devicePixelRatio: dpr } = window;
	const width: number = screen.width;
	let x = 0;
	if ('availLeft' in screen) {
		// For single screens this will always return zero.
		// For multiple screens this may exceed the width of the active screen.
		// `availLeft` is non-standard but provides a useful figure when available.
		// https://developer.mozilla.org/en-US/docs/Web/API/Screen/availLeft
		let l = (screen as any).availLeft;
		if (l > 0) x = l;
	}
	const key = `${width}_${x}_${dpr}`;
	if (!screens.has(key)) screens.set(key, { width, dpr, x });
	return screens.get(key);
}

/**
 * Detect the screen capabilities & listen for changes
 */
if (typeof window !== 'undefined') {
	// Check the capabilities of the active screen
	determineScreenCapabilities();
	// Listen for mouse enter as it's gauranteed to trigger after switching screens when
	// the user next interacts with the page. It also doesn't bubble.
	window.document.addEventListener('mouseenter', determineScreenCapabilities);
}
