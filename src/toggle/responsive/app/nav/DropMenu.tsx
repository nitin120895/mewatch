import * as React from 'react';
import { Bem } from 'shared/util/styles';
import FocusCaptureGroup from 'shared/component/FocusCaptureGroup';
import { KEY_CODE } from 'shared/util/keycodes';
import * as cx from 'classnames';

import './DropMenu.scss';

interface DropMenuProps extends React.HTMLProps<any> {
	onDismiss: () => void;
	captureFocus?: boolean;
	forceUpdate?: boolean;
	edgePadding?: number;
}

const bem = new Bem('drop-menu');

export default class DropMenu extends React.Component<DropMenuProps, any> {
	static defaultProps = {
		autoFocus: true,
		captureFocus: true,
		forceUpdate: true,
		edgePadding: 40
	};

	private content: HTMLElement;

	componentDidMount() {
		window.addEventListener('resize', this.onResize, false);
		window.addEventListener('keydown', this.onKeyDown, false);
		this.onResize();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.edgePadding !== this.props.edgePadding) {
			this.onResize();
		}
	}

	componentDidUpdate() {
		if (this.props.forceUpdate) {
			this.onResize();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		window.removeEventListener('keydown', this.onKeyDown);
	}

	private resizeContent = () => {
		if (!this.content) return;
		const { innerWidth, innerHeight } = window;
		let left = -this.content.clientWidth * 0.5;
		const edgePadding = this.props.edgePadding;
		const minLeft = edgePadding;
		const maxRight = innerWidth - edgePadding;
		this.content.style.maxWidth = maxRight - minLeft + 'px';
		this.content.style.left = left + 'px';
		const bounds = this.content.getBoundingClientRect();
		if (bounds.left < minLeft) {
			left -= bounds.left - minLeft;
		} else if (bounds.right > maxRight) {
			left -= bounds.right - maxRight;
		}
		this.content.style.left = Math.round(left) + 'px';
		this.content.style.maxHeight = innerHeight - bounds.top - edgePadding + 'px';
	};

	private onResize = (e?) => {
		window.requestAnimationFrame(this.resizeContent);
	};

	private onKeyDown = (e: KeyboardEvent) => {
		if (e.keyCode === KEY_CODE.ESC) {
			e.preventDefault();
			this.props.onDismiss();
		}
	};

	private onContentRef = (ref: HTMLElement) => {
		this.content = ref;
	};

	render() {
		const { className, children, autoFocus, captureFocus } = this.props;
		return (
			<div className={cx(bem.b(), className)}>
				<div className={bem.e('container')} ref={this.onContentRef}>
					{captureFocus ? (
						<FocusCaptureGroup className={cx(bem.e('content'))} autoFocus={autoFocus}>
							{children}
						</FocusCaptureGroup>
					) : (
						<div className={cx(bem.e('content'))}>{children}</div>
					)}
				</div>
			</div>
		);
	}
}
