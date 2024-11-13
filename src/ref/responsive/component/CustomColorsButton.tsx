import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as colorUtils from 'ref/responsive/util/color';
import { omit } from 'shared/util/objects';
import { resolveColor } from 'ref/responsive/pageEntry/util/custom';
import CtaButton, { CtaButtonProps } from 'ref/responsive/component/CtaButton';

interface CustomColorsButtonProps extends CtaButtonProps {
	textColor?: customFields.Color;
	backgroundColor?: customFields.Color;
	borderColor?: customFields.Color;
}

interface CustomColorsButtonState {
	color?: string;
	hoverColor?: string;
}

const HOVER_SHADE_PERCENTAGE = 15;

export default class CustomColorsButton extends React.Component<CustomColorsButtonProps, CustomColorsButtonState> {
	state: CustomColorsButtonState = {
		color: undefined,
		hoverColor: undefined
	};

	static defaultProps = {
		large: false
	};

	private button: HTMLElement;

	componentDidMount() {
		this.updateStyles(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.textColor !== this.props.textColor || nextProps.backgroundColor !== this.props.backgroundColor) {
			this.updateStyles(nextProps);
		}
	}

	private updateStyles(props) {
		const { textColor, backgroundColor, ordinal } = props;
		const isLight = colorUtils.isLight(backgroundColor.color);
		const shadeAmount = isLight ? HOVER_SHADE_PERCENTAGE * -1 : HOVER_SHADE_PERCENTAGE;
		const resolvedColor = backgroundColor.color ? resolveColor(backgroundColor) : undefined;

		this.button.style.color = textColor.color ? resolveColor(textColor) : '';

		if (ordinal === 'primary') {
			this.setState({
				color: resolvedColor,
				hoverColor: resolvedColor ? colorUtils.modifyBrightness(resolvedColor, shadeAmount) : undefined
			});
			this.button.style.backgroundColor = resolvedColor || '';
		} else if (ordinal === 'secondary') {
			this.setState({
				color: 'transparent',
				hoverColor: resolvedColor ? resolveColor({ ...backgroundColor, opacity: 20 }) : undefined
			});
			this.button.style.borderColor = resolvedColor || '';
			this.button.style.backgroundColor = resolvedColor ? 'transparent' : '';
		}
	}

	private onMouseEnter = () => {
		this.button.style.backgroundColor = this.state.hoverColor || '';
	};

	private onMouseLeave = () => {
		this.button.style.backgroundColor = this.state.color || '';
	};

	private onButtonReference = node => {
		if (node) this.button = findDOMNode(node);
	};

	render() {
		const { children, ...rest } = omit(this.props, 'textColor', 'backgroundColor', 'borderColor');
		return (
			<CtaButton
				{...rest}
				ref={this.onButtonReference}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				{children}
			</CtaButton>
		);
	}
}
