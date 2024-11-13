import * as React from 'react';
import * as cx from 'classnames';
import IntlFormatter from './IntlFormatter';

import './CtaButton.scss';

interface CtaButtonProps extends React.HTMLProps<any> {
	label: string;
	onClick?: () => void;
	onMouseEnter?: (index) => void;
	onMouseLeave?: () => void;
	defaultClassName?: string;
	type?: 'button' | 'submit' | 'reset';
	ordinal?: 'primary' | 'secondary';
	focusable?: boolean;
	disabled?: boolean;
	className?: string;
	focused?: boolean;
	index?: number;
}

/**
 * Call to Action Button.
 */
export default class CtaButton extends React.Component<CtaButtonProps, any> {
	static defaultProps = {
		defaultClassName: 'cta-btn',
		type: 'button',
		ordinal: 'primary',
		focusable: true,
		disabled: false
	};

	constructor(props) {
		super(props);
	}

	private handleMouseEnter = e => {
		e.preventDefault();

		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseLeave = e => {
		e.preventDefault();
		this.props.onMouseLeave && this.props.onMouseLeave();
	};

	private handleMouseClick = e => {
		e.preventDefault();
		this.props.onClick && this.props.onClick();
	};

	render() {
		const { defaultClassName, className, label, ordinal, focusable, disabled, focused } = this.props;
		const classes = cx(
			defaultClassName,
			{
				[`${defaultClassName}--${ordinal}`]: !!defaultClassName,
				focused,
				disabled
			},
			className
		);

		return (
			<IntlFormatter
				tagName="button"
				type="button"
				className={classes}
				onClick={this.handleMouseClick}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				disabled={disabled}
				tabIndex={focusable ? 0 : -1}
			>
				{label}
			</IntlFormatter>
		);
	}
}
