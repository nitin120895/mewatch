import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import './SecondaryActionButton.scss';

interface SecondaryActionButtonProps {
	className?: string;
	iconClass?: string;
	iconClassHovered?: string;
	index?: number;
	onClick?: () => void;
	onMouseEnter?: (index?: number) => void;
	onMouseLeave?: (index?: number) => void;
}

interface SecondaryActionButtonState {}

const bem = new Bem('secondary-action-btn');

export default class SecondaryActionButton extends React.Component<
	SecondaryActionButtonProps,
	SecondaryActionButtonState
> {
	constructor(props) {
		super(props);
	}

	private renderIcon = iconClass => {
		return <i className={cx(bem.e('icon'), 'icon', iconClass)} />;
	};

	private renderHoverIcon = iconClassHovered => {
		if (!iconClassHovered) {
			return;
		}
		return <i className={cx(bem.e('icon'), 'icon icon-hover', iconClassHovered)} />;
	};

	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseLeave = () => {
		const { onMouseLeave, index } = this.props;
		onMouseLeave && onMouseLeave(index);
	};

	private handleMouseClick = () => {
		this.props.onClick && this.props.onClick();
	};

	render() {
		const { className, iconClass, iconClassHovered } = this.props;
		const classes = cx('action-button', className);

		return (
			<button
				className={classes}
				onClick={this.handleMouseClick}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				{this.renderHoverIcon(iconClassHovered)}
				{this.renderIcon(iconClass)}
			</button>
		);
	}
}
