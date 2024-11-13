import * as React from 'react';
import RatingWrapper from 'ref/responsive/component/rating/RatingWrapper';
import TrailerButton from 'ref/responsive/pageEntry/itemDetail/dh1/components/TrailerButton';
import BookmarkButton from 'ref/responsive/pageEntry/itemDetail/dh1/components/BookmarkButton';
import { resolveItemOrAncestor } from 'ref/responsive/pageEntry/itemDetail/util/itemProps';

import './ItemRowComponents.scss';

interface ItemRowComponentsState {
	bookmarked?: boolean;
	item?: api.ItemDetail;
}

export default class ItemRowComponents extends React.Component<PageProps, ItemRowComponentsState> {
	constructor(props) {
		super(props);
		this.state = {
			bookmarked: false,
			item: resolveItemOrAncestor(props)
		};
	}

	private onClickBookmark = () => {
		this.setState({ bookmarked: !this.state.bookmarked });
	};

	render() {
		return (
			<main className="component item-rows">
				{this.renderRatingDisplays()}
				{this.renderSecondaryActionButtons()}
			</main>
		);
	}

	private renderRatingDisplays() {
		return (
			<section>
				<h3>Rating Displays</h3>
				<p>Average rating</p>
				{this.renderRatingWrapper('rating')}
				<p>User rating</p>
				{this.renderRatingWrapper('rating')}
			</section>
		);
	}

	private renderRatingWrapper = (component: string) => {
		return <RatingWrapper item={this.state.item} component={component} />;
	};

	private renderSecondaryActionButtons() {
		return (
			<section>
				<h3>Secondary Action Buttons</h3>
				<div className="secondary-action-buttons">
					<TrailerButton />
					<BookmarkButton onClick={this.onClickBookmark} bookmarked={this.state.bookmarked} />
					{this.renderRatingWrapper('rate')}
				</div>
			</section>
		);
	}
}
