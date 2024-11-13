import * as React from 'react';
import * as cx from 'classnames';
import StarIcon from './StarIcon';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/tv/component/IntlFormatter';

import './RatingDisplay.scss';

interface RatingDisplayProps extends React.HTMLProps<any> {
	averageRating: number;
	userCount: number;
	userRating?: number;
}

const bem = new Bem('star-rating');

const MAX_RATING = 5;

export default class RatingDisplay extends React.Component<RatingDisplayProps, any> {
	render() {
		const { className } = this.props;
		return (
			<div className={cx(bem.b(), className)}>
				{this.renderStars()}
				{this.renderLabel()}
			</div>
		);
	}

	private renderStars() {
		const { averageRating, userRating } = this.props;
		const starList = [];
		const averageRateOfFive = Math.floor(averageRating / 2);
		const rateValue = userRating > 0 ? userRating / 2 : averageRateOfFive;
		const ratingType = userRating > 0 ? 'usr' : 'avg';

		for (let i = 0; i < MAX_RATING; i++) {
			// activate the stars on the left side of current rate value
			const rateClasses = cx(bem.e('star', { [ratingType]: i < rateValue }));
			starList.push(<StarIcon key={i} className={rateClasses} />);
		}
		return <div className={bem.e('stars')}>{starList}</div>;
	}

	private renderLabel() {
		const { userCount, userRating } = this.props;
		if (userRating !== undefined) {
			return (
				<div className={bem.e('label-div')}>
					<IntlFormatter className="sr-only" tagName="p" values={{ rate: userRating, max: MAX_RATING }}>
						{`(@{itemDetail_rating_rated_aria|your rating})`}
					</IntlFormatter>
					<IntlFormatter className={bem.e('label')}>{`(@{itemDetail_rating_display|your rating})`}</IntlFormatter>
				</div>
			);
		}
		return <span className={bem.e('label')}>{`(${userCount})`}</span>;
	}
}
