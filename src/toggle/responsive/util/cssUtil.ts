export const DISABLE_TEXT_SELECT_CLASS = 'disable-text-selection';

export function toggleBodyClass(className: string) {
	document.body.classList.toggle(className);
}

export function addBodyClass(className: string) {
	document.body.classList.add(className);
}

export function removeBodyClass(className: string) {
	document.body.classList.remove(className);
}

export function hasBodyClass(className: string): boolean {
	return document.body.classList.contains(className);
}

// To dynamically set CSS variable app-height
// For fixing 100vh issue on mobile browsers, esp iOS
export function setCSSVar() {
	const doc = document.documentElement;
	doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}
