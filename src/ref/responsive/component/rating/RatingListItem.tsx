import * as React from 'react';
import * as cx from 'classnames';
import StarIcon from '../icons/StarIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';

import './RatingListItem.scss';

interface RatingListItemProps {
	className?: string;
	onMouseOver: (index: number) => void;
	onMouseLeave: (index: number) => void;
	onClick: (index: number) => void;
	highlight: boolean;
	index: number;
	maxRating: number;
}

const bem = new Bem('rating-list-item');

export default class RatingListItem extends React.Component<RatingListItemProps, any> {
	private onMouseOver = () => {
		const { onMouseOver, index } = this.props;
		if (onMouseOver) onMouseOver(index);
	};

	private onMouseLeave = () => {
		const { onMouseLeave, index } = this.props;
		if (onMouseLeave) onMouseLeave(index);
	};

	private onClick = () => {
		const { onClick, index } = this.props;
		if (onClick) onClick(index);
	};

	render() {
		const { className, index, highlight, maxRating } = this.props;
		const classes = cx(bem.b(), className);
		const iconClasses = cx(bem.e('icon', { highlight }), 'svg-icon');
		return (
			<IntlFormatter
				elementType="button"
				className={classes}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
				onClick={this.onClick}
				formattedProps={{
					'aria-label': '@{itemDetail_rating_rate_aria|Rate {rate, number} out of {max, number}}'
				}}
				values={{ rate: index + 1, max: maxRating }}
			>
				<StarIcon className={iconClasses} />
			</IntlFormatter>
		);
	}
}
