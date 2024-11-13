import * as React from 'react';
import RatingListItem from './RatingListItem';
import { Bem } from 'shared/util/styles';

import './RatingList.scss';

interface RatingListProps {
	onRated: (rating: number) => void;
	rating?: number;
	maxRating?: number;
	centered?: boolean;
}

interface RatingListState {
	hoverIndex?: number;
}

const bem = new Bem('rating-list');

export default class RatingList extends React.Component<RatingListProps, RatingListState> {
	static defaultProps = {
		maxRating: 5
	};

	constructor(props) {
		super(props);
		this.state = { hoverIndex: -1 };
	}

	private onMouseOver = (hoverIndex: number) => {
		this.setState({ hoverIndex });
	};

	private onMouseLeave = (index: number) => {
		this.setState({ hoverIndex: -1 });
	};

	private onClick = (index: number) => {
		this.props.onRated(index + 1);
	};

	render() {
		const { centered } = this.props;
		return <div className={bem.b({ centered })}>{this.renderItems()}</div>;
	}

	private renderItems() {
		const { rating, maxRating } = this.props;
		const { hoverIndex } = this.state;
		const starList = [];
		for (let i = 0; i < maxRating; i++) {
			starList.push(
				<RatingListItem
					key={i}
					onMouseOver={this.onMouseOver}
					onMouseLeave={this.onMouseLeave}
					onClick={this.onClick}
					index={i}
					maxRating={maxRating}
					highlight={(i < rating && hoverIndex === -1) || i <= this.state.hoverIndex}
				/>
			);
		}
		return starList;
	}
}
