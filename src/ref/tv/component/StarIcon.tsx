import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './StarIcon.scss';

type StarIconProps = {
	isActive: boolean;
	isFocused: boolean;
	index?: number;
	onMouseEnter?: (index) => void;
	onClick?: (index) => void;
};

type StarIconState = {
	curIndex?: number;
};

const bemStarIcon = new Bem('star-icon');

export default class StarIcon extends React.Component<StarIconProps, StarIconState> {
	static defaultProps = {
		isActive: false,
		isFocused: false
	};

	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseClick = () => {
		const { onClick, index } = this.props;
		onClick && onClick(index);
	};

	render() {
		const { isActive, isFocused } = this.props;

		return (
			<i
				className={cx('icon icon-rate-star', bemStarIcon.e('star', { isActive, isFocused }))}
				onMouseEnter={this.handleMouseEnter}
				onClick={this.handleMouseClick}
			/>
		);
	}
}
