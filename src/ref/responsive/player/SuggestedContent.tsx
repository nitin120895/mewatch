import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { getRelatedItems } from 'shared/app/playerWorkflow';
import PackshotList from '../component/PackshotList';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { posterColumnsSuggested, squareColumns } from 'ref/responsive/pageEntry/branded/columns';

const MAX_ITEMS_COUNT = 3;

interface SuggestedContentProps extends React.Props<any> {
	item: api.ItemDetail;
	playerId: string;
	getRelatedItems: (itemId: string, site: string) => Promise<any>;
	relatedItems: api.ItemList;
	className?: string;
}

class SuggestedContent extends React.Component<SuggestedContentProps> {
	componentDidMount() {
		const { item, getRelatedItems, playerId } = this.props;
		getRelatedItems(item.id, playerId);
	}

	private hasRelatedItems() {
		const { relatedItems } = this.props;
		return relatedItems && relatedItems.items && relatedItems.items.length > 0;
	}

	private getFormattedRelatedItems() {
		const { relatedItems } = this.props;
		const maxItemsCount = Math.min(MAX_ITEMS_COUNT, relatedItems.items.length);

		return {
			...relatedItems,
			items: relatedItems.items.slice(0, maxItemsCount),
			size: maxItemsCount,
			paging: {
				total: 1,
				page: 1,
				size: maxItemsCount
			}
		};
	}

	private getImageType() {
		return this.props.item.type === 'movie' ? 'poster' : 'tile';
	}

	render() {
		if (this.hasRelatedItems()) {
			const { className } = this.props;
			const imageType = this.getImageType();
			const formattedItems = this.getFormattedRelatedItems();
			const packshotProps = { hasHover: false, hasOverlay: true, hasPlayIcon: true };
			return (
				<div className={cx(className, imageType === 'poster' ? 'suggested-content-poster' : 'suggested-content-tile')}>
					<IntlFormatter elementType="h4">
						{'@{endOfPlayback_suggested_content_title|You might also like}'}
					</IntlFormatter>
					<PackshotList
						list={formattedItems}
						imageType={imageType}
						packshotTitlePosition={'none'}
						columns={imageType === 'poster' ? posterColumnsSuggested : squareColumns}
						className="player-row-peek"
						packshotProps={packshotProps}
					/>
				</div>
			);
		}

		return false;
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const players = state.player.players;
	const { playerId } = ownProps;
	return {
		relatedItems: players && players[playerId] && players[playerId].relatedItems
	};
}

function mapDispatchToProps(dispatch) {
	return {
		getRelatedItems: (itemId: string, playerId: string) => {
			return dispatch(getRelatedItems(itemId, playerId));
		}
	};
}

export default connect<SuggestedContentProps, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(SuggestedContent);
