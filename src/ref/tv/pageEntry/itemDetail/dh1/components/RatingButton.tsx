import * as React from 'react';
import * as cx from 'classnames';
import SecondaryActionButton from './SecondaryActionButton';

interface RatingButtonProps {
	className?: string;
	rating?: number;
	opened?: boolean;
	index?: number;
	onClick?: () => void;
	onMouseEnter?: (index?: number) => void;
	onMouseLeave?: (index?: number) => void;
}

interface RatingButtonState {}

export default class RatingButton extends React.Component<RatingButtonProps, RatingButtonState> {
	constructor(props) {
		super(props);
	}

	render() {
		const { className, rating, index, onClick, onMouseEnter, onMouseLeave } = this.props;

		return (
			<SecondaryActionButton
				className={cx('rating-button', className)}
				iconClass={rating ? 'icon-rate-star' : 'icon-no-rate-star'}
				index={index}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			/>
		);
	}
}
