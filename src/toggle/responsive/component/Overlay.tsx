import * as React from 'react';
import { findDOMNode } from 'react-dom';
import FocusCaptureGroup from 'shared/component/FocusCaptureGroup';
import { Bem } from 'shared/util/styles';
import { wrap } from 'shared/util/function';
import * as cx from 'classnames';

import './Overlay.scss';

interface OverlayProps extends React.HTMLProps<any> {
	groupClassName?: string;
	opened?: boolean;
	onDismiss?: () => void;
	role?: string;
	ariaLabel?: string;
	enableScroll?: boolean;
	isTransparent?: boolean;
}

interface OverlayState {
	mounted: boolean;
}

const bem = new Bem('overlay');

/**
 * A generic component allowing for creation of overlays at any depth in
 * the DOM structure.
 *
 * Automatically handles blocking of click, touch, and scroll events
 * outside of the provided children (e.g. beneath the modal layer).
 *
 * Accepts multiple children, however by default only the immediate children
 * that are nested within this component can be made scrollable
 *
 * If you wish to have some scrollable elements which are further nested,
 * you can render a Component at the top level which will then be provided
 * a prop `onScrollableChildRef` which you can assign as the ref for any
 * scrollable children nested within the overlay
 */
export default class Overlay extends React.Component<OverlayProps, OverlayState> {
	static defaultProps = {
		opened: true,
		role: 'dialog'
	};
	state: OverlayState = {
		mounted: false
	};
	static activeCount = 0;

	private touchStartY: number;
	private container: HTMLElement;
	private children: Set<HTMLElement> = new Set();

	componentDidMount() {
		// In order to achieve the opacity transition, we need to slightly delay setting the
		// opacity of the background of the overlay. The component is initially rendered
		// with the background opacity set to 0, and once mounted the state updates
		// triggering a re-render after which we apply an opacity of 1 to the background
		this.setState({ mounted: true });

		if (this.props.enableScroll) {
			this.container.addEventListener('touchmove', this.onContainerTouchMove, false);
			this.container.addEventListener('wheel', this.blockBodyScrolling, false);
		}
	}

	componentWillUnmount() {
		this.container.removeEventListener('touchmove', this.onContainerTouchMove);
		this.container.removeEventListener('wheel', this.blockBodyScrolling);
		this.children.forEach(el => {
			el.removeEventListener('touchstart', this.onChildTouchStart);
			el.removeEventListener('touchmove', this.onChildTouchMove);
			el.removeEventListener('touchend', this.onChildTouchEnd);
			el.removeEventListener('wheel', this.allowChildScrolling);
		});
	}

	private shouldClampScrolling(element: HTMLElement, deltaY: number) {
		if (deltaY > 0) {
			// Scrolled down
			return element.scrollTop + element.clientHeight === element.scrollHeight;
		} else if (deltaY < 0) {
			// Scrolled up
			return element.scrollTop === 0;
		}
		return true;
	}

	private stopImmediatePropagation(e: React.SyntheticEvent<any>) {
		e.stopPropagation();
		if (e.nativeEvent) {
			e.nativeEvent.stopImmediatePropagation();
		}
	}

	private blockBodyScrolling = e => {
		if (this.props.opened) e.preventDefault();
	};

	private onContainerTouchMove = e => {
		this.blockBodyScrolling(e);
	};

	private onContainerRef = ref => {
		this.container = findDOMNode<HTMLElement>(ref);
	};

	private allowChildScrolling = (e, deltaY = NaN) => {
		if (this.props.opened) this.stopImmediatePropagation(e);
		if (isNaN(deltaY)) deltaY = e.deltaY;
		if (this.shouldClampScrolling(e.currentTarget, deltaY)) {
			this.blockBodyScrolling(e);
		}
	};

	private onChildRef = ref => {
		if (!ref) return;
		const el = findDOMNode<HTMLElement>(ref);
		if (!this.children.has(el)) {
			this.children.add(el);
			if (this.props.enableScroll) {
				el.addEventListener('touchstart', this.onChildTouchStart, false);
				el.addEventListener('touchmove', this.onChildTouchMove, false);
				el.addEventListener('touchend', this.onChildTouchEnd, false);
				el.addEventListener('wheel', this.allowChildScrolling, false);
			}
		}
	};

	private onChildTouchStart = e => {
		if (!this.props.opened) return;
		this.stopImmediatePropagation(e);
		this.touchStartY = e.changedTouches[0].pageY;
	};

	private onChildTouchMove = e => {
		const deltaY = this.touchStartY - e.changedTouches[0].pageY;
		this.allowChildScrolling(e, deltaY);
	};

	private onChildTouchEnd = e => {
		this.stopImmediatePropagation(e);
	};

	render() {
		const { className, groupClassName, role, opened, onDismiss, isTransparent } = this.props;
		const hidden = !this.state.mounted || !opened;
		const children = React.Children.map(this.props.children, (child: React.DOMElement<any, any>) => {
			return React.cloneElement(child, {
				...child.props,
				ref: wrap(child.ref as any, this.onChildRef)
			});
		});
		return (
			<div
				ref={this.onContainerRef}
				className={cx(bem.b({ transparent: isTransparent }), className)}
				role={role}
				aria-label={this.props.ariaLabel}
			>
				<div
					role="button"
					className={bem.e('backdrop', { hidden })}
					tabIndex={opened ? 0 : -1}
					aria-hidden={!opened}
					onClick={onDismiss}
				/>
				<FocusCaptureGroup autoFocus className={cx(groupClassName)} focusable={!hidden} onEscape={onDismiss}>
					{children}
				</FocusCaptureGroup>
			</div>
		);
	}
}
