import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './CtaToggleButton.scss';

interface SecondaryActionButtonProps {
	className?: string;
	labelId: string;
	labelIdActive?: string;
	labelIdHovered?: string;
	labelIdActiveHovered?: string;
	svgData: string;
	svgDataHovered?: string;
	onClick?: () => void;
	hasPopUp?: boolean;
}

interface SecondaryActionButtonState {
	hovered?: boolean;
}

const bem = new Bem('cta-toggle-btn');

export default class CtaToggleButton extends React.Component<SecondaryActionButtonProps, SecondaryActionButtonState> {
	// On touch devices we don't want to trigger the hover state on mouse over
	// touching the button triggers mouse over but not mouse out which leaves
	// the button in the hovered state. When a touch event starts we set this
	// value to true and then prevent entering the hover state on mouse over
	private isTouchDevice = false;

	constructor(props) {
		super(props);
		this.state = {
			hovered: false
		};
	}

	private onTouchStart = e => {
		this.isTouchDevice = true;
	};

	private onClick = e => {
		const { onClick } = this.props;
		if (onClick) onClick();
	};

	private onMouseOver = e => {
		if (this.isTouchDevice) return;

		if (!this.state.hovered) {
			this.setState({
				hovered: true
			});
		}
	};

	private onMouseOut = e => {
		if (this.state.hovered) {
			this.setState({
				hovered: false
			});
		}
	};

	render() {
		const {
			className,
			labelId,
			labelIdHovered,
			labelIdActive,
			labelIdActiveHovered,
			svgData,
			svgDataHovered,
			hasPopUp
		} = this.props;
		const { hovered } = this.state;
		const svg = (hovered && svgDataHovered) || svgData;
		const labelActive = labelIdActive ? labelIdActive : labelId;
		const labelHovered = labelIdHovered ? labelIdHovered : labelId;
		const labelActiveHovered = labelIdActiveHovered ? labelIdActiveHovered : labelId;
		const labelStatic = hovered ? labelHovered : labelId;

		return (
			<button
				className={cx(bem.b({ hovered }), className)}
				onClick={this.onClick}
				onMouseOver={this.onMouseOver}
				onMouseOut={this.onMouseOut}
				onTouchEnd={this.onMouseOut}
				onTouchStart={this.onTouchStart}
				onFocus={this.onMouseOver}
				onBlur={this.onMouseOut}
				aria-haspopup={hasPopUp}
			>
				<svg className={cx(bem.e('icon'), 'svg-icon')}>
					<path d={svg} fill="currentColor" stroke="currentStroke" />
				</svg>
				<IntlFormatter className={cx(bem.e('label', 'static'))}>{labelStatic}</IntlFormatter>
				<IntlFormatter className={cx(bem.e('label', 'active'))}>{labelActive}</IntlFormatter>
				<IntlFormatter className={cx(bem.e('label', 'active-hover'))}>{labelActiveHovered}</IntlFormatter>
			</button>
		);
	}
}
