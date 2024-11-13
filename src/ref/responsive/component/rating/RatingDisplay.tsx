import * as React from 'react';
import * as cx from 'classnames';
import StarIcon from 'ref/responsive/component/icons/StarIcon';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './RatingDisplay.scss';

interface RatingDisplayProps extends React.HTMLProps<any> {
	averageRating: number;
	userCount: number;
	userRating?: number;
	maxRating?: number;
}

const bem = new Bem('star-rating');

export default class RatingDisplay extends React.Component<RatingDisplayProps, any> {
	static defaultProps = {
		maxRating: 5
	};

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
		const { averageRating, userRating, maxRating } = this.props;
		const starList = [];
		const selectedIndex = (userRating > 0 ? userRating : Math.round(averageRating)) - 1;
		for (let i = 0; i < maxRating; i++) {
			const rateClasses = cx(bem.e('star', { [userRating > 0 ? 'usr' : 'avg']: i <= selectedIndex }));
			starList.push(<StarIcon key={i} className={rateClasses} />);
		}
		return <div className={bem.e('stars')}>{starList}</div>;
	}

	private renderLabel() {
		const { userCount, userRating, averageRating, maxRating } = this.props;
		if (userRating) {
			return (
				<div>
					<IntlFormatter elementType="p" className="sr-only" values={{ rate: userRating, max: maxRating }}>
						{`@{itemDetail_rating_rated_user_aria|Rated {rate} out of {max} by you}`}
					</IntlFormatter>
					<IntlFormatter className={bem.e('label')} aria-hidden={true}>
						{`@{itemDetail_rating_rated_user|(Your Rating)}`}
					</IntlFormatter>
				</div>
			);
		}

		return (
			<div>
				<IntlFormatter
					elementType="p"
					className="sr-only"
					values={{ rate: Math.round(averageRating), max: maxRating, count: userCount }}
				>
					{!averageRating
						? '@{itemDetail_rating_no_avg_aria|No user ratings}'
						: '@{itemDetail_rating_rated_avg_aria|Average rating {rate} out of {max} from {count} users}'}
				</IntlFormatter>
				{!!userCount && (
					<IntlFormatter className={bem.e('label')} values={{ count: userCount }} aria-hidden={true}>
						{'@{itemDetail_rating_rated_avg|({count})}'}
					</IntlFormatter>
				)}
			</div>
		);
	}
}
