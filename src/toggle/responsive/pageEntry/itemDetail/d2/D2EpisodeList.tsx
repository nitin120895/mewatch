import * as React from 'react';
import * as cx from 'classnames';
import SeasonSelector from 'ref/responsive/pageEntry/itemDetail/d1/SeasonSelector';
import EpisodeSortingSelector, { EpisodeSortingOrder } from './EpisodeSortingSelector';
import EpisodeRangeSelector, { EPISODES_PER_OPTION, RANGE_OPTION_ALL } from './EpisodeRangeSelector';
import SeasonDescription from 'ref/responsive/pageEntry/itemDetail/d1/SeasonDescription';
import { EpisodeListData, getShowSeasonAndEpisode } from 'ref/responsive/pageEntry/util/episodeList';
import EpisodeListItem from './EpisodeListItem';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { Bem } from 'shared/util/styles';
import { calcEpisodeGroupsByIndex, EpisodeRange } from '../../utils/episodeRange';
import { get } from 'shared/util/objects';
import { getItemChildrenList } from 'shared/service/action/content';
import { connect } from 'react-redux';
import { D2EpisodeList as template } from 'shared/page/pageEntryTemplate';
import { SortingOptions } from 'shared/list/listUtil';
import { GetItemChildrenListOptions } from 'shared/service/content';
import {
	getSignInRequiredModalForAnonymous,
	getRestrictedModalForAnonymous
} from 'toggle/responsive/player/playerModals';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import {
	isRestrictedForAnonymous,
	onPlayerSignIn,
	onPlayerSignUp,
	isContentProviderCeased
} from 'toggle/responsive/util/playerUtil';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { isAnonymousUser, setSessionFilter, setItemListingAttributes } from 'shared/account/sessionWorkflow';
import {
	subscriptionRequiredModal,
	SubscriptionsModalProps,
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';
import {
	redirectToSignPage,
	redirectToSubscriptions
} from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import { canPlay, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import { isEpisode } from 'toggle/responsive/util/item';
import { browserHistory } from 'shared/util/browserHistory';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';

import './D2EpisodeList.scss';

const enum Selectors {
	Range = 'Range',
	Sort = 'Sort'
}

interface CustomFields {
	seasonOrder?: 'ascending' | 'descending';
	seasonDescription?: boolean;
	episodeThumbnail?: boolean;
}

interface State {
	range?: EpisodeRange;
	order?: EpisodeSortingOrder;
	episodeGroups: EpisodeRange[];
	activeSelector: Selectors;
	episodes: api.ItemList;
}

interface StateProps {
	config: api.AppConfig;
	isAnonymous: boolean;
	order: EpisodeSortingOrder;
	range: EpisodeRange;
	filterSetPath: string;
	continuousScrollEpisodeCount?: number;
}

interface DispatchProps {
	getItemChildrenList: (id: string, options: GetItemChildrenListOptions) => Promise<any>;
	getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => void;
	getSignInRequiredModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => void;
	openModal?: (modalConfig: ModalConfig) => void;
	closeModal: (id: string) => void;
	pageAnalyticsEvent: (path: string) => any;
	setSessionFilter: (payload: {}) => void;
	updateItemListingAttributes: (payload: {}) => void;
	updateSubscriptionEntryPoint: (entryPoint) => void;
}

const DEFAULT_PAGE_SIZE = 50;
export type D2EpisodeListProps = TPageEntryItemDetailProps<CustomFields>;

const bem = new Bem('d2');
const bemSeasonGroupElement = new Bem('season-group');

type Props = D2EpisodeListProps & DispatchProps & StateProps;

class D2EpisodeList extends React.Component<Props, State> {
	state: State = {
		episodeGroups: [],
		activeSelector: undefined,
		episodes: this.getEpisodes(this.getItemFromCache(this.props.item))
	};

	componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
		const { item } = this.props;
		const isItemEpisode = isEpisode(item);
		const currentItem = isItemEpisode ? this.getItemFromCache(item) : item;
		const nextItem = isItemEpisode ? this.getItemFromCache(nextProps.item) : nextProps.item;

		const prevEpisode = this.getEpisodes(currentItem);
		const currentEpisode = this.getEpisodes(nextItem);

		if (currentEpisode && prevEpisode && currentEpisode.id !== prevEpisode.id) {
			this.setState({
				episodes: currentEpisode,
				episodeGroups: calcEpisodeGroupsByIndex(currentEpisode.size)
			});
		}
	}

	componentDidMount() {
		this.setState(
			{
				episodeGroups: calcEpisodeGroupsByIndex(this.getAvailableEpisodeCount())
			},
			() => {
				const {
					item: { availableEpisodeCount, episodes },
					continuousScrollEpisodeCount
				} = this.props;
				if (
					continuousScrollEpisodeCount < availableEpisodeCount &&
					continuousScrollEpisodeCount > episodes.items.length
				) {
					this.continuousScrollSwitchRange();
				}
				this.onChangeRange();
			}
		);
	}

	componentDidUpdate(prevProps: Props) {
		const { pageAnalyticsEvent, order, range, item } = this.props;

		if (range === undefined || prevProps.range === undefined) return;

		const sameRange = range.from === prevProps.range.from && range.to === prevProps.range.to;
		const sameOrder = order === prevProps.order;
		const sameItemPath = item.path === prevProps.item.path;

		if (sameRange && sameOrder && sameItemPath) return;

		this.onChangeRange();

		pageAnalyticsEvent(item.path);
	}

	private getItemDetailsFromCache(updatedItem?: api.ItemDetail): EpisodeListData {
		const { itemDetailCache, item } = this.props;
		const currentItem = updatedItem ? updatedItem : item;
		return getShowSeasonAndEpisode(currentItem, itemDetailCache);
	}

	private onRangeChange = range => {
		const watchPath = this.props.item.path;
		this.props.setSessionFilter({ filterId: watchPath, filter: { range } });
	};

	private onOrderChange = (order: EpisodeSortingOrder) => {
		const watchPath = this.props.item.path;
		this.props.setSessionFilter({ filterId: watchPath, filter: { order } });
	};

	private setActiveSelector = (activeSelector: Selectors) => {
		this.setState({ activeSelector });
	};

	private getItemFromCache(updatedItem: api.ItemDetail): api.ItemDetail {
		const { item } = this.props;
		if (isEpisode(item) || updatedItem) return this.getItemDetailsFromCache(updatedItem).season;

		return item;
	}

	private getEpisodes(updatedItem: api.ItemDetail): api.ItemList {
		const { item } = this.props;
		if (isEpisode(item) || updatedItem) return updatedItem && updatedItem.episodes;

		return item && item.episodes;
	}

	private getAvailableEpisodeCount(item?: api.ItemDetail): number {
		const currentItem = item ? item : this.getItemFromCache(this.props.item);
		return (currentItem && currentItem.availableEpisodeCount) || 0;
	}

	private onEpisodeClick = (episode: api.ItemDetail) => {
		const { isAnonymous, item } = this.props;
		const registrationOnlyRequired = isRegistrationOnlyRequired(episode);

		if (isAnonymous && canPlay(episode) && !registrationOnlyRequired) {
			browserHistory.push(episode.watchPath);
			return;
		}

		if (isAnonymous && !registrationOnlyRequired) {
			isContentProviderCeased(item) ? this.showCessationUpsellModal() : this.showUpsellModal(episode);
			return;
		}

		if (isRestrictedForAnonymous(episode)) {
			this.showRestrictedContentModal();
			return;
		}

		if (canPlay(episode)) {
			browserHistory.push(episode.watchPath);
			return;
		}

		if (isAnonymous && registrationOnlyRequired) {
			this.showSignInRequiredModal(episode);
			return;
		}
		isContentProviderCeased(item) ? this.showCessationUpsellModal() : this.showSubscriptionRequiredModal(episode);
	};

	private showSubscriptionRequiredModal = (episode: api.ItemDetail) => {
		const { openModal } = this.props;

		const props: SubscriptionsModalProps = {
			onConfirm: () => this.onSubscribe(episode),
			target: 'app',
			isSignedInUser: true
		};

		openModal(subscriptionRequiredModal(props));
	};

	private showSignInRequiredModal = (episode: api.ItemDetail) => {
		const { getSignInRequiredModalForAnonymous } = this.props;
		getSignInRequiredModalForAnonymous(() => onPlayerSignIn(), () => onPlayerSignUp());
	};

	private showRestrictedContentModal = () => {
		const { getRestrictedContentModalForAnonymous } = this.props;
		getRestrictedContentModalForAnonymous(() => onPlayerSignIn(), () => onPlayerSignUp());
	};

	private showUpsellModal = (episode: api.ItemDetail) => {
		const upsellModalProps: UpsellModalProps = {
			onSubscribe: () => this.onSubscribe(episode),
			onSignIn: () => this.onSignIn()
		};
		this.props.openModal(upsellModal(upsellModalProps));
	};

	private showCessationUpsellModal = () => {
		const { isAnonymous, openModal, item } = this.props;
		const upsellModalProps: UpsellModalProps = !isAnonymous
			? { onSubscribe: () => this.onCessationCancelClick() }
			: {
					onSubscribe: () => this.onCessationCancelClick(),
					onSignIn: () => this.onSignIn()
			  };

		const provider = get(item, 'customFields.Provider');
		openModal(upsellCessationModal(upsellModalProps, provider));
	};

	private onSignIn = () => {
		const { config, item } = this.props;
		redirectToSignPage(config, encodeURIComponent(item.path));
	};

	private onSubscribe = item => {
		const { config, updateSubscriptionEntryPoint } = this.props;
		updateSubscriptionEntryPoint(MixpanelEntryPoint.IDPEpisode);
		redirectToSubscriptions(item, config);
	};
	private onCessationCancelClick = () => {
		const { closeModal } = this.props;
		closeModal(UPSELL_CESSATION_MODAL);
	};

	render() {
		const { item, customFields, range } = this.props;
		const { episodes, episodeGroups } = this.state;
		const { seasonOrder, seasonDescription } = customFields || ({} as CustomFields);
		const data = this.getItemDetailsFromCache();
		const seasons = get(data, `show.seasons`);
		const items = get(episodes, 'items');
		if (!items) return false;

		const { activeSelector } = this.state;
		const selectorsGroupClassname =
			items.length < EPISODES_PER_OPTION
				? cx(bem.e(bemSeasonGroupElement.b()), bem.e(`${bemSeasonGroupElement.b()}-inline`))
				: bem.e(bemSeasonGroupElement.b());
		return (
			<section className={cx(bem.b(), 'clearfix')}>
				<div className={selectorsGroupClassname}>
					{seasons && seasons.items && (
						<SeasonSelector
							seasons={seasons.items}
							selectedSeasonId={data.season.id}
							reverse={seasonOrder === 'descending'}
							className="season-selector-container"
							autoExpand={true}
						/>
					)}
					<div className={bem.e('episodes-sorting')}>
						<EpisodeRangeSelector
							onRangeChange={this.onRangeChange}
							options={episodeGroups}
							episodesAmount={this.getAvailableEpisodeCount()}
							setActiveSelector={() => this.setActiveSelector(Selectors.Range)}
							isActive={activeSelector === Selectors.Range}
							itemId={item.id}
							activeRange={range}
						/>
						<EpisodeSortingSelector
							onOrderChange={this.onOrderChange}
							setActiveSelector={() => this.setActiveSelector(Selectors.Sort)}
							isActive={activeSelector === Selectors.Sort}
							itemsAlignLeft={this.getAvailableEpisodeCount() < EPISODES_PER_OPTION}
							watchPath={item.path}
						/>
					</div>
				</div>
				{seasonDescription && <SeasonDescription className={bem.e('description')} item={data.season || item} />}
				{this.renderEpisodes(data)}
			</section>
		);
	}

	private renderEpisodes({ show, season, episode: currentEpisode }: EpisodeListData): any {
		const { episodes } = this.state;
		const { range } = this.props;
		const items = get(episodes, 'items');
		if (items && !items.length) return undefined;

		const { activeProfile, clientSide, customFields, continuousScrollEpisodeCount } = this.props;
		const { episodeThumbnail } = customFields || ({} as CustomFields);

		// Display Load More CTA when there are more episodes available and All Episodes filter is selected
		const hasNextPage = episodes.size > continuousScrollEpisodeCount && range.key === RANGE_OPTION_ALL;
		return (
			<div className={bem.e('item-container')}>
				{items.slice(0, continuousScrollEpisodeCount).map((episode, index) => (
					<EpisodeListItem
						key={`episode-${episode.id}`}
						episode={{ ...episode, season }}
						showTitle={show && show.title}
						seasonNumber={season && season.seasonNumber}
						isSelected={currentEpisode && currentEpisode.id === episode.id}
						displayPackshot={episodeThumbnail}
						isSignedIn={activeProfile && clientSide}
						getRestrictedContentModal={this.showRestrictedContentModal}
						onClick={this.onEpisodeClick}
						ignoreLink={true}
						index={index}
					/>
				))}
				{hasNextPage && (
					<CtaButton ordinal="secondary" theme="light" onClick={this.loadNextPage}>
						<IntlFormatter>{'@{itemDetail_episode_loadMore_cta_label}'}</IntlFormatter>
					</CtaButton>
				)}
			</div>
		);
	}

	onChangeRange = () => {
		const { item, order, range, updateItemListingAttributes } = this.props;
		const isRange = range && range.key !== RANGE_OPTION_ALL;
		const page = Math.ceil(range.from / EPISODES_PER_OPTION);
		const options = {
			pageSize: isRange ? EPISODES_PER_OPTION : DEFAULT_PAGE_SIZE,
			page: isRange ? page : 1,
			order: SortingOptions.Earliest
		};
		if (!isRange && order === EpisodeSortingOrder.latest) options.order = SortingOptions.Latest;

		updateItemListingAttributes({ id: item.id, continuousScrollEpisodeCount: EPISODES_PER_OPTION });
		this.requestNewData(item.id, false, options);
	};

	loadNextPage = () => {
		const { item, continuousScrollEpisodeCount, updateItemListingAttributes, order } = this.props;
		const { episodes } = this.state;
		const options = {
			pageSize: DEFAULT_PAGE_SIZE,
			page: episodes.paging.page + 1,
			order: SortingOptions.Earliest
		};
		if (order === EpisodeSortingOrder.latest) options.order = SortingOptions.Latest;

		const id = item.id;
		const loadMore = continuousScrollEpisodeCount + EPISODES_PER_OPTION;
		if (loadMore > episodes.items.length) {
			this.requestNewData(item.id, true, options);
		}
		updateItemListingAttributes({ id, continuousScrollEpisodeCount: loadMore });
	};

	requestNewData = (id, isConcat, options) => {
		const { episodes } = this.state;
		const { item, order, range, getItemChildrenList } = this.props;

		const itemId = isEpisode(item) ? item.seasonId : id;
		getItemChildrenList(itemId, options).then(data => {
			let items;
			const { paging } = data.payload;
			if (isConcat) {
				items = episodes.items.concat(data.payload.items);
			} else {
				items = data.payload.items;
				if (order === EpisodeSortingOrder.latest && range.key !== RANGE_OPTION_ALL) {
					items = items.slice().reverse();
				}
			}
			this.setState({ episodes: { ...episodes, items, paging } });
		});
	};

	continuousScrollSwitchRange = () => {
		const { episodeGroups } = this.state;
		const { continuousScrollEpisodeCount } = this.props;
		this.onRangeChange(episodeGroups[continuousScrollEpisodeCount / EPISODES_PER_OPTION]);
	};
}

function mapStateToProps(state: state.Root, props: Props): StateProps {
	const { app, session } = state;
	const { item } = props;
	const continuousScrollEpisodeCount = get(session.itemListingTracking, item.id) || EPISODES_PER_OPTION;
	const range = get(session.filters[item.path], 'range') || {
		from: 1,
		to: item.availableEpisodeCount,
		key: RANGE_OPTION_ALL
	};
	const filterSetPath = get(session, 'filters.filterSetPath') || item.path;
	const order = get(session.filters[item.path], 'order') || EpisodeSortingOrder.earliest;

	return {
		config: app.config,
		isAnonymous: isAnonymousUser(state),
		order,
		range,
		filterSetPath,
		continuousScrollEpisodeCount
	};
}
function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => {
			dispatch(OpenModal(getRestrictedModalForAnonymous(onSignIn, onSignUp)));
		},
		getSignInRequiredModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => {
			dispatch(OpenModal(getSignInRequiredModalForAnonymous(onSignIn, onSignUp)));
		},
		getItemChildrenList: (id: string, options: GetItemChildrenListOptions) =>
			dispatch(getItemChildrenList(id, options)),
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		pageAnalyticsEvent: (path: string) => dispatch(pageAnalyticsEvent(path)),
		setSessionFilter: (payload: object) => dispatch(setSessionFilter(payload)),
		updateItemListingAttributes: (loadMore: number) => dispatch(setItemListingAttributes(loadMore)),
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

const Component: any = connect<StateProps, DispatchProps, any>(
	mapStateToProps,
	mapDispatchToProps
)(D2EpisodeList);

Component.template = template;

export default Component;
