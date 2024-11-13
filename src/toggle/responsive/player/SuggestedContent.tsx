import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { getRecommendedItems } from 'shared/app/playerWorkflow';
import { ZOOM_WIDGET_COLD_START_EOP_WEB, isBoostRecommendationList } from 'shared/list/listUtil';
import { GetRecommendationsListOptions } from 'shared/service/content';
import { get } from 'shared/util/objects';

import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import SuggestedContentList from 'toggle/responsive/player/SuggestedContentList';

const MAX_ITEMS_COUNT = 3;

interface SuggestedContentProps extends React.Props<any> {
	item: api.ItemDetail;
	playerId: string;
	widgetId: string;
	currentUrl: string;
	template: string;
	getRecommendedItems: (
		widgetId: string,
		options?: GetRecommendationsListOptions,
		item?: api.ItemDetail,
		info?: any
	) => Promise<any>;
	relatedItems: api.ItemList;
	className?: string;
}

class SuggestedContent extends React.Component<SuggestedContentProps> {
	componentDidMount() {
		const { getRecommendedItems, playerId, widgetId, currentUrl: url, item, template, relatedItems } = this.props;
		const showUrl = get(item, 'season.show.path');
		const path = get(item, 'path');
		const currentUrl = showUrl ? showUrl : path || url;

		if (!relatedItems) {
			getRecommendedItems(
				widgetId,
				{
					currentUrl
				},
				item,
				{ playerId, template }
			);
		}
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

	render() {
		if (this.hasRelatedItems()) {
			const { className, item } = this.props;
			const formattedItems = this.getFormattedRelatedItems();

			return (
				<div className={cx(className, 'suggested-content-tile')}>
					<IntlFormatter elementType="h4" className="title">
						{'@{endOfPlayback_suggested_content_title|You might also like}'}
					</IntlFormatter>
					<SuggestedContentList list={formattedItems} videoItem={item} />
				</div>
			);
		}

		return false;
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const players = state.player.players;
	const { playerId, item } = ownProps;
	const personalisation = get(state, 'app.config.personalisation');

	const getCache = get(state, `cache.page.${item.watchPath}`);
	const getEnteries = getCache && getCache.entries;
	const templateEntry = getEnteries && getEnteries.length >= 2 && getCache.entries[1];
	const getTemplate = get(templateEntry, 'template');

	const zoomWidgetId = get(personalisation, ZOOM_WIDGET_COLD_START_EOP_WEB);
	const boostWidgetId = get(templateEntry, 'customFields.boostWidgetId');
	const opts = { template: getTemplate };

	const isBoostRecommendations = isBoostRecommendationList(opts);

	// Read related items list from cache instead of player as boost items in response is not coming through
	const relatedItemsKey = get(players, `${playerId}.relatedItems.key`);
	const boostRelatedItems = get(state, `cache.list.${relatedItemsKey}.list`);

	const zoomRelatedItems = get(players, `${playerId}.relatedItems`);

	return {
		relatedItems: isBoostRecommendations ? boostRelatedItems : zoomRelatedItems,
		widgetId: isBoostRecommendations ? boostWidgetId : zoomWidgetId,
		currentUrl: get(state, 'page.history.location.pathname'),
		template: getTemplate
	};
}

function mapDispatchToProps(dispatch) {
	return {
		getRecommendedItems: (
			widgetId: string,
			options?: GetRecommendationsListOptions,
			item?: api.ItemDetail,
			info?: any
		) => {
			return dispatch(getRecommendedItems(widgetId, options, item, info));
		}
	};
}

export default connect<SuggestedContentProps, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(SuggestedContent);
