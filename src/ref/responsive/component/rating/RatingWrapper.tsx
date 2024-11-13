import * as React from 'react';
import { connect } from 'react-redux';
import RatingDisplay from './RatingDisplay';
import RatingList from './RatingList';
import Overlay from 'ref/responsive/component/Overlay';
import RatingButton from '../rating/RatingButton';
import { rateItem } from 'shared/account/profileWorkflow';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';

import './RatingWrapper.scss';

interface RatingWrapperProps {
	item: api.ItemDetail;
	component: 'rate' | 'rating' | 'rate_or_rating';
	redirectPath?: string;
}

interface RatingWrapperMappedProps {
	userRating: number;
	onStateChanged?: (opened: boolean) => void;
}

interface RatingWrapperDispatchProps {
	rateItem: (item: api.ItemSummary, rating: number, ratingScale: number) => Promise<any>;
}

interface RatingWrapperState {
	ratingOpened?: boolean;
	centered?: boolean;
}

// We display 5 stars, however services expect ratings to be on a scale of 10
const MAX_STARS = 5;
const MAX_RATING = 10;
const RATING_SCALE = MAX_RATING / MAX_STARS;
const WINDOW_WIDTH_CHECK = 265;

const bem = new Bem('rating');

class RatingWrapper extends React.Component<
	RatingWrapperProps & RatingWrapperMappedProps & RatingWrapperDispatchProps,
	RatingWrapperState
> {
	static defaultProps = {
		onStateChanged: noop
	};

	state = {
		ratingOpened: false,
		centered: false
	};

	private wrapper: HTMLElement;

	componentDidMount() {
		this.getPosition();
		window.addEventListener('resize', this.onResize, false);
		this.onResize();
	}

	componentWillUpdate(nextProps: any, nextState: RatingWrapperState) {
		if (this.state.ratingOpened !== nextState.ratingOpened) {
			this.props.onStateChanged(nextState.ratingOpened);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
	}

	private getPosition() {
		if (!this.wrapper) return;
		const rightPosition = this.wrapper.getBoundingClientRect().right;
		this.setState({
			centered: rightPosition < WINDOW_WIDTH_CHECK
		});
	}

	private onResize = () => {
		this.getPosition();
	};

	private onToggleRatingOverlay = () => {
		this.setState({ ratingOpened: !this.state.ratingOpened });
	};

	private onDismissRatingOverlay = () => {
		this.setState({ ratingOpened: false });
	};

	private onChangeRating = (rating: number) => {
		const { item, rateItem } = this.props;
		// Convert selected star rating out of 5 to correct scale expected by services
		rateItem(item, rating * RATING_SCALE, RATING_SCALE);
	};

	private onRatingWrapperRef = (ref: HTMLElement) => {
		this.wrapper = ref;
	};

	private onRated = (rating: number) => {
		this.onDismissRatingOverlay();
		this.onChangeRating(rating);
	};

	render() {
		const { component, item } = this.props;
		if (!item) return false;

		return (
			<div className={cx(bem.b('wrapper', component))}>
				{this.renderRateOverlay()}
				{this.renderRating()}
			</div>
		);
	}

	renderRating() {
		const { component, item } = this.props;
		const { totalUserRatings, averageUserRating } = item;
		const averageRating = (averageUserRating || 0) / RATING_SCALE;

		switch (component) {
			case 'rate':
			case 'rate_or_rating':
				return this.renderRate();
			case 'rating':
				return (
					<div>
						<RatingDisplay
							averageRating={averageRating}
							userCount={totalUserRatings}
							userRating={this.props.userRating}
							maxRating={MAX_STARS}
						/>
					</div>
				);
			default:
				return <div />;
		}
	}

	private renderRate() {
		return (
			<div ref={this.onRatingWrapperRef} onClick={this.onToggleRatingOverlay}>
				<RatingButton rating={this.props.userRating} />
			</div>
		);
	}

	private renderRateOverlay() {
		const opened = this.state.ratingOpened;
		if (!opened) return;
		return (
			<Overlay onDismiss={this.onDismissRatingOverlay}>
				<RatingList
					onRated={this.onRated}
					rating={this.props.userRating}
					maxRating={MAX_STARS}
					centered={this.state.centered}
				/>
			</Overlay>
		);
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const { profile } = state;
	let rated;
	if (profile) {
		const { info } = profile;
		rated = info && info.rated;
	}

	return {
		userRating: ownProps.item && rated && rated[ownProps.item.id] / RATING_SCALE
	};
}

function mapDispatchToProps(dispatch) {
	return {
		rateItem: (item: api.ItemSummary, rating: number, ratingScale = 1) => dispatch(rateItem(item, rating, ratingScale))
	};
}

export default connect<RatingWrapperProps, RatingWrapperDispatchProps, any>(
	mapStateToProps,
	mapDispatchToProps
)(RatingWrapper);
