declare function escape(s: string): string;

/*
	Check if script has been injected before
 */
export const hasInjectedScript = (scriptUrl: string) => {
	const scripts = Array.from(document.getElementsByTagName('script'));
	return scripts.some(({ src }) => src === scriptUrl);
};

/*
	Utility function to inject script only once.
 */
export const injectScriptOnce = (url: string): Promise<Event> => {
	return new Promise((resolve, reject) => {
		if (hasInjectedScript(url)) return resolve();

		const script = document.createElement('script');
		const nonce = document.querySelector('[nonce]').getAttribute('nonce');
		script.src = url;
		script.async = true;
		script.nonce = nonce;
		script.onload = resolve;
		script.onerror = script.onabort = reject;
		document.body.appendChild(script);
	});
};

export function decodeUTF8(str: string) {
	return decodeURIComponent(escape(str));
}

const WAITING_INTERVAL = 200;
const WAITING_COUNTER = 75;
export function onLibraryLoaded(checker): Promise<any> {
	let counter = 0;
	let waiterTimer = undefined;
	return new Promise((resolve, reject) => {
		const result = checker();
		if (!result) {
			const waiter = () => {
				const result = checker();
				if (result) {
					clearTimeout(waiterTimer);
					resolve(result);
				} else {
					waiterTimer = setTimeout(waiter, WAITING_INTERVAL);
				}
			};
			if (counter < WAITING_COUNTER) {
				waiterTimer = setTimeout(waiter, WAITING_INTERVAL);
			} else {
				reject();
			}
		} else {
			resolve(result);
		}
	});
}
