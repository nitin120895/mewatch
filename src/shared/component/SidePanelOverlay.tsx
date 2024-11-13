import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as cx from 'classnames';
import warning from '../util/warning';
import { KEY_CODE } from '../util/keycodes';
import { isIOS, supportsPassiveEvents } from '../util/browser';
import FocusCaptureGroup from './FocusCaptureGroup';
import { Bem } from '../../shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

/**
 * The number of pixels a touch drag must move either horizontally or vertically to
 * initiate a movement.
 *
 * Vertically for scrolling the panel and horizontally for dragging the panel.
 *
 * Only one may be active at a given time.
 */
const TOUCH_TOLERANCE = 10;

/**
 * This component requires styling to function correctly.
 *
 * For an example of its styles see: `src/ref/responsive/shared-components.scss`
 */

interface SidePanelOverlayProps extends React.HTMLProps<any> {
	visible: boolean;
	onDismiss: () => void;
	defaultClassName?: string;
	edge?: 'left' | 'right';
	ariaLabel?: string;
	closeAriaLabel?: string;
}

/**
 * Collapsable Overlay Side Panel
 *
 * A panel which slides on/off the screen. It can be anchored to either the
 * left or right edge of the screen. Perfect for navigational elements on
 * handheld devices.
 *
 * While open we block body scrolling of the page content beneath the panel's layer,
 * however we allow vertical scrolling of overflowing content within the panel.
 *
 * The panel can be dismissed using horizontal swipe gestures or by clicking outside
 * of the panel within the layer.
 *
 * Closure of the panel via external events such as navigating should be handled
 * externally by adjusting the value of the `visible` prop.
 */
export default class SidePanelOverlay extends React.PureComponent<SidePanelOverlayProps, any> {
	static defaultProps = {
		// If you provide your own you'll need to define your own alternate styles to match those defined within
		defaultClassName: 'side-panel',
		edge: 'left',
		visible: false,
		autoFocus: true
	};

	private container: HTMLElement;
	private panel: HTMLElement;
	private closeBtn: HTMLElement;

	// Touch screen properties
	private touching = false;
	private scrolling = false;
	private dragging = false;
	private pageScrollEnabled = true;
	private ios = isIOS();
	private startX: number;
	private currentX: number;
	private prevX: number;
	private startY: number;
	private currentY: number;
	private prevY: number;
	private pageScrollTop: number;
	private keyListenerEnabled = false;

	componentDidMount() {
		const options: any = supportsPassiveEvents() ? { passive: true } : false;
		this.panel.addEventListener('transitionend', this.onTransitionEnd, options);
		this.setKeyListenerEnabled(this.props.visible);
		this.setPageScrollEnabled(!this.props.visible);
	}

	componentDidUpdate(prevProps: SidePanelOverlayProps, prevState: any) {
		if (this.props.visible !== prevProps.visible) {
			this.setKeyListenerEnabled(this.props.visible);
			this.setPageScrollEnabled(!this.props.visible);
		}
	}

	componentWillUnmount() {
		this.panel.removeEventListener('transitionend', this.onTransitionEnd);
		this.panel.removeEventListener('scroll', this.onPanelScroll);
		this.setKeyListenerEnabled(false);
		this.setPageScrollEnabled(true);
	}

	private setPageScrollEnabled(enabled: boolean) {
		if (this.pageScrollEnabled === enabled) return;
		this.pageScrollEnabled = enabled;
		const doc = document.documentElement;
		if (enabled) {
			doc.style.overflow = '';
			if (!this.ios) {
				doc.style.position = '';
				doc.style.top = '';
				doc.style.left = '';
				doc.style.right = '';
				window.scroll(0, this.pageScrollTop);
			}
		} else {
			// reset panel scroll position when opening overlay
			this.panel.scrollTop = 0;
			doc.style.overflow = 'hidden';
			// If not ios then we can change the page to position fixed
			// and offset its top positon so it looks identical,
			// but the page can't scroll. This works for iOS too
			// however it forces the browser chrome to appear which
			// isn't as friendly. Because of this we go a more complex
			// and potentially less performant path of capturing
			// touch events for ios.
			if (!this.ios) {
				this.pageScrollTop = window.pageYOffset;
				doc.style.top = -this.pageScrollTop + 'px';
				doc.style.left = '0px';
				doc.style.right = '0px';
				doc.style.position = 'fixed';
			}
		}
	}

	private setKeyListenerEnabled(enabled: boolean) {
		if (this.keyListenerEnabled === enabled) return;
		this.keyListenerEnabled = enabled;
		if (enabled) {
			window.addEventListener('keydown', this.onKeyDown, false);
		} else {
			window.removeEventListener('keydown', this.onKeyDown);
		}
	}

	private scrollingActivated() {
		this.dragging = false;
		this.scrolling = true;
		this.panel.removeEventListener('scroll', this.onPanelScroll);
	}

	private draggingActivated() {
		this.dragging = true;
		this.scrolling = false;
		this.panel.style.overflowY = 'hidden';
		this.panel.removeEventListener('scroll', this.onPanelScroll);
	}

	private onKeyDown = (e: KeyboardEvent) => {
		if (e.keyCode === KEY_CODE.ESC) {
			e.preventDefault();
			this.hide(e);
		}
	};

	private onContainerRef = node => (this.container = node);
	private onPanelRef = node => (this.panel = node);
	private onCloseBtnRef = node => (this.closeBtn = ReactDOM.findDOMNode(node));

	private onTransitionEnd = e => {
		// Allow the panel to be dragged on touch devices
		if (this.container) this.container.classList.remove(`${this.props.defaultClassName}--animatable`);
	};
	private onPanelScroll = e => this.scrollingActivated();

	private hide = e => this.props.onDismiss();
	private stopImmediatePropagation = e => {
		if (e.touches) e.preventDefault();
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
	};

	// The difference between the scrolled start position and current position
	private getOffsetX() {
		return this.props.edge === 'left' ? this.currentX - this.startX : this.startX - this.currentX;
	}

	// The difference between the current scroll position, and when we last checked it
	private getDeltaX() {
		return this.currentX - this.prevX;
	}

	// Whether the gesture is in the direction of the closing edge
	private isClosingSwipe(deltaX: number) {
		if (!this.dragging || this.scrolling) return false;

		const w = this.panel.offsetWidth;
		const offsetX = Math.min(0, this.getOffsetX());
		const remainingX = offsetX + w;
		const halfway = remainingX / w < 0.65;

		if (this.props.edge === 'left') {
			if ((!halfway && deltaX < 4) || (halfway && deltaX <= 0)) return true;
		} else {
			if ((!halfway && deltaX > 4) || (halfway && deltaX >= 0)) return true;
		}
		return false;
	}

	// Redraw function while dragging the panel
	update = () => {
		if (!this.touching || this.scrolling) return;
		window.requestAnimationFrame(this.update);

		// Update the position to match the dragged position
		const offsetX = Math.min(0, this.getOffsetX());
		if (!this.dragging) {
			if (Math.abs(offsetX) >= TOUCH_TOLERANCE) {
				this.draggingActivated();
			} else {
				// if attempting to scroll up/down against an edge this
				// should still activate scrolling
				if (Math.abs(this.currentY - this.startY) >= TOUCH_TOLERANCE) {
					this.scrollingActivated();
				}
				return;
			}
		}

		const translateX = this.props.edge === 'right' ? Math.abs(offsetX) : offsetX;
		this.panel.style.transform = `translateX(${translateX}px)`;
	};

	private storeInitialTouchValues(e) {
		const { clientX, pageY } = e.changedTouches[0];
		this.startX = clientX;
		this.currentX = this.startX;
		this.startY = pageY;
		this.currentY = this.startY;
	}

	private storeCurrentTouchValues(e) {
		const { clientX, pageY } = e.changedTouches[0];
		this.prevX = this.currentX;
		this.prevY = this.currentY;
		this.currentX = clientX;
		this.currentY = pageY;
	}

	private clampIosBodyScrolling(e) {
		if (!this.ios) return;

		if (this.dragging || e.target === this.closeBtn) {
			this.stopImmediatePropagation(e);
			return;
		}

		const deltaY = this.currentY - this.prevY;
		if (deltaY >= 0 && this.panel.scrollTop <= 0) {
			this.stopImmediatePropagation(e);
		} else if (deltaY <= 0 && this.panel.scrollHeight - this.panel.scrollTop <= this.panel.clientHeight) {
			this.stopImmediatePropagation(e);
		}
	}

	// Our container only allows horizontal dragging only
	private onContainerTouchStart = e => {
		if (!this.props.visible) return;
		if (e.touches.length !== 1) {
			// A touch gesture may have been started with a single finger but
			// then a second is added. In this case we cancel our interaction
			// and let the browser's default behaviour takeover.
			if (this.touching) {
				this.onContainerTouchEnd(e);
			}
			return;
		}
		this.storeInitialTouchValues(e);
		this.touching = true;
		this.scrolling = false;
		this.dragging = false;
		this.container.classList.remove(`${this.props.defaultClassName}--animatable`);
		if (e.target !== this.closeBtn) {
			this.panel.addEventListener('scroll', this.onPanelScroll, false);
			window.requestAnimationFrame(this.update);
		}
	};
	private onContainerTouchMove = e => {
		if (!this.touching) return;
		this.storeCurrentTouchValues(e);
		this.clampIosBodyScrolling(e);
	};
	private onContainerTouchEnd = e => {
		if (!this.touching) return;
		this.touching = false;
		this.panel.removeEventListener('scroll', this.onPanelScroll);
		this.panel.style.transform = '';
		this.panel.style.overflowY = '';
		this.container.classList.add(`${this.props.defaultClassName}--animatable`);
		const deltaX = this.getDeltaX();
		if (this.isClosingSwipe(deltaX)) {
			this.hide(e);
		}
		this.scrolling = false;
		this.dragging = false;
	};

	render() {
		const { id, className, defaultClassName, visible, ariaLabel } = this.props;
		if (_DEV_ && !defaultClassName) warning('SidePanelOverlay requires a `defaultClassName` value');
		const bem = new Bem(defaultClassName);
		const containerClasses = cx(bem.b({ animatable: true, visible }), className);
		return (
			<aside
				id={id}
				className={containerClasses}
				aria-hidden={!visible}
				aria-label={ariaLabel}
				role={ariaLabel ? undefined : 'presentation'}
				ref={this.onContainerRef}
				onTouchStart={this.onContainerTouchStart}
				onTouchMove={this.onContainerTouchMove}
				onTouchEnd={this.onContainerTouchEnd}
			>
				{this.renderCloseButton(bem)}
				{this.renderPanel(bem)}
			</aside>
		);
	}

	private renderCloseButton(bem: Bem) {
		const { visible, closeAriaLabel } = this.props;
		if (!visible) return;
		return (
			<IntlFormatter
				elementType="button"
				className={bem.e('close-btn')}
				formattedProps={{
					'aria-label': closeAriaLabel
				}}
				ref={this.onCloseBtnRef}
				onClick={this.hide}
			/>
		);
	}

	private renderPanel(bem: Bem) {
		const { visible, autoFocus, children, edge } = this.props;
		return (
			<div className={bem.e('panel', edge)} ref={this.onPanelRef} onClick={this.stopImmediatePropagation}>
				<FocusCaptureGroup focusable={visible} autoFocus={autoFocus}>
					{children}
				</FocusCaptureGroup>
			</div>
		);
	}
}
