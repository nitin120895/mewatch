import * as React from 'react';
import CtaToggleButton from '../CtaToggleButton';
import * as cx from 'classnames';

import './RatingButton.scss';

interface RatingButtonProps {
	className?: string;
	rating?: number;
}

interface RatingButtonState {
	centered: boolean;
}

const STAR_SVG_DATA =
	'm13,1l3.53,7.15l7.89,1.15l-5.71,5.56l1.35,7.85l-7.05,-3.71l-7.05,3.71l1.35,-7.85l-5.71,-5.56l7.89,-1.15z';

export default class RatingButton extends React.Component<RatingButtonProps, RatingButtonState> {
	render() {
		const { className, rating } = this.props;
		const rated = !!rating;
		const classNameBtn = 'rating-btn';
		const classNameActiveBtn = 'rating-btn rated active';
		return (
			<div className={cx('rating-button', className)}>
				<CtaToggleButton
					labelId={'@{itemDetail_rating_rate_default|Rate}'}
					labelIdActive={'@{itemDetail_rating_rated_default|Rated}'}
					labelIdHovered={'@{itemDetail_rating_rate_hovered|Rate}'}
					labelIdActiveHovered={'@{itemDetail_rating_rated_hovered|Change}'}
					svgData={STAR_SVG_DATA}
					svgDataHovered={STAR_SVG_DATA}
					hasPopUp={true}
					className={rated ? classNameActiveBtn : classNameBtn}
				/>
			</div>
		);
	}
}
