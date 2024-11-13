let lastActiveTime;

/**
 * init user activity monitor
 */
export function init() {
	if (typeof window !== 'undefined') {
		window.addEventListener('keydown', onInteractionHandler);
		window.addEventListener('touchend', onInteractionHandler);
		window.addEventListener('mousemove', onInteractionHandler);

		lastActiveTime = Date.now();
	}
}

/**
 * get user's last activity time
 */
export function getLastUserActivityTime() {
	if (typeof window === 'undefined') return undefined;
	return lastActiveTime;
}

/**
 * check, if user was active within last @time
 * @time - time in miliseconds
 */
export function wasActiveWithin(time: number) {
	if (typeof window === 'undefined') return true;
	return Date.now() - lastActiveTime < time;
}

function onInteractionHandler(e: any) {
	lastActiveTime = Date.now();
}
