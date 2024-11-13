import { KEY_CODE } from './keycodes';
import warning from './warning';

type InputModeChangeHandler = (mode: input.Mode) => void;

/**
 * Activate keyboard vs mouse mode checking.
 *
 * Applies `data-inputmode` attribute to html document element which will either have the value
 * `k` for keyboard or `m` for mouse, depending on how the user is interacting with the site.
 */
export function setInputModeCheck(enabled: boolean) {
	if (typeof document === 'undefined') return;
	if (!focusStyleSwitcher) focusStyleSwitcher = new FocusStyleSwitcher();
	focusStyleSwitcher.setEnabled(enabled);
}

/**
 * If a component needs to respond to input mode switching then it can subscribe
 * to the change event via this method. Call this within `componentDidMount`.
 *
 * This should be used sparingly. When possible it's preferred to adjust to input
 * mode changes within CSS instead of JS.
 *
 * @param cb The callback function to trigger when the input mode changes.
 */
export function subscribeToInputModeChanges(cb: InputModeChangeHandler) {
	if (!focusStyleSwitcher) {
		if (_DEV_) {
			warning('A11Y: `subscribeToInputModeChanges` ignored. Call `setInputModeCheck` first.');
		}
		return;
	}
	const i = focusStyleSwitcher.subscribers.indexOf(cb);
	if (!~i) focusStyleSwitcher.subscribers.push(cb);
}

/**
 * If a component needs to respond to input mode switching then it should unsubscribe
 * from the change event via this method. Call this within `componentWillUnmount`.
 *
 * @param cb The callback function which was subscribed to input mode changes.
 */
export function unsubscribeFromInputModeChanges(cb: InputModeChangeHandler) {
	if (!focusStyleSwitcher) return;
	const i = focusStyleSwitcher.subscribers.indexOf(cb);
	if (~i) focusStyleSwitcher.subscribers.splice(i, 1);
}

/**
 * Returns the input mode which is currently in use
 */
export function getCurrentInputMode(): input.Mode {
	if (_SERVER_) return 'mouse';
	if (!focusStyleSwitcher) {
		if (_DEV_) {
			warning('A11Y: `getCurrentInputMode` ignored. Call `setInputModeCheck` first.');
		}
		return undefined;
	}
	return focusStyleSwitcher.mode;
}

const InputModeAttribute: input.Modes = {
	mouse: 'm',
	key: 'k'
};

const INPUT_MODE_ATTR = 'data-inputmode';
let focusStyleSwitcher: FocusStyleSwitcher;

class FocusStyleSwitcher {
	private element: HTMLElement;
	private enabled = false;
	mode: input.Mode;

	subscribers: InputModeChangeHandler[];

	constructor() {
		this.element = document.documentElement;
		this.subscribers = [];
	}

	setEnabled(enabled: boolean) {
		if (enabled === this.enabled) return;
		this.enabled = enabled;
		if (enabled) {
			this.element.addEventListener('keydown', this.onKeyDown, false);
			this.element.addEventListener('mousedown', this.onMouseDown, false);
			this.setMouseMode();
		} else {
			this.element.removeEventListener('keydown', this.onKeyDown);
			this.element.removeEventListener('mousedown', this.onMouseDown);
			this.element.removeAttribute(INPUT_MODE_ATTR);
		}
	}

	private setMouseMode() {
		if (this.mode !== 'mouse') {
			this.mode = 'mouse';
			this.element.setAttribute(INPUT_MODE_ATTR, InputModeAttribute.mouse);
			this.notifySubscribers();
		}
	}

	private setKeyboardMode() {
		if (this.mode !== 'key') {
			this.mode = 'key';
			this.element.setAttribute(INPUT_MODE_ATTR, InputModeAttribute.key);
			this.notifySubscribers();
		}
	}

	private onMouseDown = (e: MouseEvent) => {
		this.setMouseMode();
	};

	private onKeyDown = (e: KeyboardEvent) => {
		if (e.which === KEY_CODE.TAB || e.ctrlKey) {
			this.setKeyboardMode();
		}
	};

	private notifySubscribers = () => {
		for (let cb of this.subscribers) cb(this.mode);
	};
}
