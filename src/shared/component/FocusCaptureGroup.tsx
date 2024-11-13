import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { KEY_CODE } from '../util/keycodes';
import { getFirstFocusableElement, getLastFocusableElement } from 'shared/util/browser';
import { wrap } from 'shared/util/function';

interface FocusCaptureGroupProps extends React.HTMLProps<any> {
	focusable?: boolean;
	focusFirstElement?: () => void;
	focusLastElement?: () => void;
	// If you don't want to close on ESC then don't provide a handler.
	// E.g. for system errors which require explicit user response via child elements.
	onEscape?: () => void;
}

/**
 * A container element to keep the focus wrapped inside the rendered child element.
 *
 * This component must only be rendered with a single child or wrap a list of children inside a component.
 *
 * If rendered with a single child, The child may optionally implement these public methods:
 * focusFirstElement, focusLastElement
 *
 * If rendered with a list of children, focusFirstElement & focusLastElement should be provided via props.
 *
 * If focusFirstElement, focusLastElement are not provided in props, and are not public functions in the child,
 * default functions are called.
 *
 * Whenever focus leaves the bottom of the child of this component the focusFirstElement
 * method is called on the child to instruct it to wrap focus back to the beginning.
 * Similarly when focus leaves the top of the child of this component the focusLastElement
 * method will be called.
 */
export default class FocusCaptureGroup extends React.Component<FocusCaptureGroupProps, any> {
	static defaultProps = {
		focusable: true,
		autoFocus: true
	};

	private container: HTMLElement;
	private child: any;
	private first: HTMLElement;
	private last: HTMLElement;
	private prevActiveElement: HTMLElement;
	private keyListenerActive = false;

	componentDidMount() {
		this.prevActiveElement = document.activeElement as HTMLElement;

		const { focusable, autoFocus, onEscape } = this.props;

		if (focusable) {
			if (autoFocus) this.focusFirstElement();
			if (onEscape) this.toggleKeyListener(true);
		}
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.focusable && this.props.focusable) {
			// Remember the focused element before FocusCaptureGroup starts to capture focus.
			this.prevActiveElement = document.activeElement as HTMLElement;

			if (this.props.autoFocus) {
				this.focusFirstElement();
			}
		}

		// Reset focus on the previous active element
		if (prevProps.focusable && !this.props.focusable && this.prevActiveElement) {
			window.requestAnimationFrame(() => {
				// We delay focus restoration by a frame to allow for the scenario where the previous
				// active element is hidden via CSS and therefore unavailable to receive focus.
				// e.g. if the prevActiveElement's parent is set to `display: none` temporarily while
				// a modal layer containing this instance is active.
				this.prevActiveElement.focus();
			});
		}

		// Toggle key listener as needed
		this.toggleKeyListener(this.props.focusable && !!this.props.onEscape);
	}

	componentWillUnmount() {
		this.toggleKeyListener(false);
		if (this.prevActiveElement) {
			this.prevActiveElement.focus();
		}
	}

	private activateCaptureButtons() {
		if (!this.props.focusable) return;
		if (this.first) this.first.attributes['tabIndex'] = 0;
		if (this.last) this.last.attributes['tabIndex'] = 0;
	}

	private deactivateCaptureButtons() {
		if (this.first) this.first.attributes['tabIndex'] = -1;
		if (this.last) this.last.attributes['tabIndex'] = -1;
	}

	private toggleKeyListener(active: boolean) {
		if (this.keyListenerActive === active) return;
		this.keyListenerActive = active;
		if (active) {
			window.addEventListener('keydown', this.onKeyDown, false);
		} else {
			window.removeEventListener('keydown', this.onKeyDown);
		}
	}

	private triggerFunc(name: string, fallbackFunc?: () => void) {
		if (this.props[name]) {
			this.props[name]();
		} else if (this.child && this.child[name]) {
			this.child[name]();
		} else if (fallbackFunc) {
			fallbackFunc();
		}
	}

	private focusFirstElement = () => {
		this.triggerFunc('focusFirstElement', this.onDefaultFocusFirstElement);
	};

	private focusLastElement = () => {
		this.triggerFunc('focusLastElement', this.onDefaultFocusLastElement);
	};

	private onKeyDown = (e: KeyboardEvent) => {
		if (e.keyCode === KEY_CODE.ESC) {
			e.preventDefault();
			this.props.onEscape();
		}
	};

	private onDefaultFocusFirstElement = () => {
		// Make the first and last capture buttons unfocusable
		// getFirstFocusableElement will then only return focusable elements within the children
		this.deactivateCaptureButtons();
		const el = getFirstFocusableElement(this.container);
		this.activateCaptureButtons();
		if (el) el.focus();
	};

	private onDefaultFocusLastElement = () => {
		// Make the first and last capture buttons unfocusable
		// getFirstFocusableElement will then only return focusable elements within the children
		this.deactivateCaptureButtons();
		const el = getLastFocusableElement(this.container);
		this.activateCaptureButtons();
		if (el) el.focus();
	};

	private onFocusFirst = e => {
		window.requestAnimationFrame(this.focusLastElement);
	};

	private onFocusLast = e => {
		window.requestAnimationFrame(this.focusFirstElement);
	};

	private onChildRef = (ref: any) => {
		if (!ref) {
			this.child = undefined;
		} else if (!ref.focusLastElement && ref.getWrappedInstance) {
			this.child = ref.getWrappedInstance();
		} else {
			this.child = findDOMNode(ref);
		}
	};

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private onFirstRef = (ref: HTMLElement) => {
		this.first = ref;
	};

	private onLastRef = (ref: HTMLElement) => {
		this.last = ref;
	};

	render() {
		const { className, children, focusFirstElement, focusLastElement } = this.props;

		// If focusFirstElement and focusLastElement are not provided in props,
		// then get child ref to check whether child has public methods or not.
		let newChildren = children;
		if (!focusFirstElement && !focusLastElement && React.Children.count(children) === 1) {
			const child = React.Children.toArray(children)[0] as React.DOMElement<any, any>;
			newChildren = React.cloneElement(child, { ref: wrap(child.ref as any, this.onChildRef) });
		}

		return (
			<div className={className} ref={this.onContainerRef}>
				{this.renderCaptureButton(this.onFirstRef, this.onFocusFirst)}
				{newChildren}
				{this.renderCaptureButton(this.onLastRef, this.onFocusLast)}
			</div>
		);
	}

	private renderCaptureButton(ref: any, onFocus: any) {
		return (
			this.props.focusable && (
				<button ref={ref} type="button" className="focus-capture" onFocus={onFocus} aria-hidden={true} />
			)
		);
	}
}
