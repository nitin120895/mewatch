import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import VideoItemWrapper from 'shared/analytics/components/VideoItemWrapper';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import { UPDATE_PLAYER_ENTRY_POINT } from 'shared/app/playerWorkflow';
import { browserHistory } from 'shared/util/browserHistory';
import { Bem } from 'shared/util/styles';
import TickIcon from './TickIcon';
import CloseIcon from './CloseIcon';
import AngleArrowDownIcon from '../../player/controls/icons/AngleArrowDownIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { EPISODES_PER_OPTION } from '../../pageEntry/itemDetail/d2/EpisodeRangeSelector';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import { redirectToSubscriptions, redirectToSignPage } from '../../pageEntry/subscription/subscriptionsUtils';
import {
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	SubscriptionsModalProps,
	subscriptionRequiredModal,
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from '../../util/subscriptionUtil';
import { canPlay, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import { getItemChildrenList } from 'shared/service/action/content';
import Spinner from 'ref/responsive/component/Spinner';
import { get } from 'shared/util/objects';
import LazyLoadingScrollingList from '../LazyLoadingScrollingList';
import { SortingOptions } from 'shared/list/listUtil';
import { GetItemChildrenListOptions } from 'shared/service/content';
import { getItemWithCacheCreator, getProgress } from 'shared/util/itemUtils';
import { getLastPageInHistoryBeforeIgnored } from 'shared/page/pageUtil';
import { Watch } from 'shared/page/pageKey';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { getItem } from 'shared/service/content';
import { isTabletSize } from 'ref/responsive/util/grid';
import Badge from 'toggle/responsive/component/Badge';
import { isRestrictedForAnonymous, isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import { getRestrictedModalForAnonymous } from 'toggle/responsive/player/playerModals';

import './OverlayEpisodeSelector.scss';

const bem = new Bem('overlay-episode-selector');

const PAGE_SIZE = 13;
const ITEM_HEIGHT_MOBILE = 130;
const ITEM_HEIGHT_DESKTOP = 160;

interface OverlayEpisodeSelectorState {
	ref: Element;
	showEpisodes: boolean;
	currentSeason: api.ItemDetail;
	noDissmissOnUnmount: boolean;
	continuousScrollEpisodeCount: number;
	paging: number;
	items: ItemDetailWithLoading[];
	itemHeight: number;
}

export interface OverlayEpisodeSelectorOwnProps {
	seasons: api.ItemSummary[];
	selectedSeason: api.ItemDetail;
	item: api.ItemDetail;
	currentProgress: string;
	className?: string;
	buttonRef?: Element;
	onScrollableChildRef?: any;
	onDissmiss?: (watchPath?: string) => void;
	id: string;
	toggleOverlayEpisodeSelector: () => void;
}

interface OverlayEpisodeSelectorDispatchProps extends ModalManagerDispatchProps {
	openModal?: (modalConfig: ModalConfig) => void;
	getItemChildrenList: (id: string, options: GetItemChildrenListOptions) => Promise<any>;
	getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => void;
	updateVideoEntryPoint: (entryPoint: VideoEntryPoint) => void;
}

interface OverlayEpisodeSelectorStateProps {
	config?: state.Config;
	isSignedInUser?: boolean;
	redirectPathAfterSignIn: string;
	watched: { [key: string]: api.Watched };
}

type OverlayEpisodeSelectorProps = OverlayEpisodeSelectorOwnProps &
	OverlayEpisodeSelectorDispatchProps &
	OverlayEpisodeSelectorStateProps;

class OverlayEpisodeSelector extends React.Component<OverlayEpisodeSelectorProps, OverlayEpisodeSelectorState> {
	scrollContainerRef: Element;
	selectedEpisodeRef: Element;
	getItemWithCache = getItemWithCacheCreator();

	constructor(props) {
		super(props);

		this.state = {
			ref: undefined,
			showEpisodes: true,
			currentSeason: props.selectedSeason,
			noDissmissOnUnmount: false,
			continuousScrollEpisodeCount: EPISODES_PER_OPTION - 1,
			paging: 1,
			items: new Array(props.item.season.availableEpisodeCount).fill({ loading: true }),
			itemHeight: this.getItemHeight()
		};
	}

	componentDidMount() {
		window.addEventListener('resize', this.onResize);
	}

	componentWillUnmount() {
		if (!this.state.noDissmissOnUnmount) this.props.onDissmiss();
		window.removeEventListener('resize', this.onResize);
	}

	onResize = () => {
		this.setState({ itemHeight: this.getItemHeight() });
		this.forceUpdate();
	};

	private getItemHeight() {
		return isTabletSize() ? ITEM_HEIGHT_MOBILE : ITEM_HEIGHT_DESKTOP;
	}

	onOverlayEpisodeSelectorRef = element => {
		if (!this.state.ref) {
			this.setState({ ref: element });
		}
	};

	onScrollableContinerRef = element => {
		this.scrollContainerRef = element;
		this.scrollToCurrentItem();
	};

	onClose = () => {
		const { closeModal, onDissmiss, id } = this.props;
		closeModal(id);
		onDissmiss();
	};

	onSeasonBtnClick = e => {
		this.setState({
			showEpisodes: !this.state.showEpisodes
		});
	};

	scrollToCurrentItem = () => {
		this.scrollToItem(this.selectedEpisodeRef);
	};

	scrollToItem = item => {
		if (this.scrollContainerRef && item) {
			item.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	render() {
		const { showEpisodes, currentSeason, itemHeight, items } = this.state;
		const { className, seasons, item } = this.props;
		const scrollIndex = item.seasonId !== currentSeason.id ? 0 : item.episodeIndex;

		return (
			<div>
				<div ref={this.onOverlayEpisodeSelectorRef} className={cx(bem.b({ 'show-episodes': showEpisodes }), className)}>
					<div className={bem.e('title', { 'no-border': showEpisodes })}>
						<div className={bem.e('season-btn')} onClick={this.onSeasonBtnClick}>
							<IntlFormatter elementType="span" values={{ season: currentSeason.seasonNumber }}>
								{'@{itemDetail_seasonList_season_label|Season {season}}'}
							</IntlFormatter>

							<AngleArrowDownIcon className={cx({ filp: !showEpisodes })} />
						</div>

						<div className={bem.e('cancel', { top: true }, { 'show-episodes': showEpisodes })} onClick={this.onClose}>
							<CloseIcon />
						</div>
					</div>

					{showEpisodes
						? currentSeason.episodes && (
								<div className={bem.e('overflow')} ref={this.onScrollableContinerRef}>
									<LazyLoadingScrollingList
										scrollIndex={scrollIndex}
										length={currentSeason.availableEpisodeCount}
										hasNextPage={true}
										loadNextPage={this.loadNextPage}
										scrollContainer={this.scrollContainerRef}
										pageSize={PAGE_SIZE}
										height={itemHeight}
									>
										{items.map(this.renderItem)}
									</LazyLoadingScrollingList>
								</div>
						  )
						: seasons && seasons.map(this.renderSeason)}

					{!showEpisodes && (
						<div className={bem.e('cancel')} onClick={this.onClose}>
							<CloseIcon /> Cancel
						</div>
					)}
				</div>
			</div>
		);
	}

	renderSeason = (season: api.ItemDetail) => {
		const { currentSeason } = this.state;
		const classes = bem.e('season', { selected: season.id === currentSeason.id });

		return (
			<div
				key={season.id}
				id={season.id}
				className={cx(classes, 'video-type')}
				onClick={() => this.onSeasonChange(season)}
			>
				<IntlFormatter elementType="span" values={{ season: season.seasonNumber }}>
					{'@{itemDetail_seasonList_season_label|Season {season}}'}
				</IntlFormatter>
				{season.id === currentSeason.id && <TickIcon />}
			</div>
		);
	};

	renderItem = (item: ItemDetailWithLoading, index) => {
		const { currentSeason, itemHeight } = this.state;
		const { item: videoItem } = this.props;
		const selectedItem = { ...item, season: currentSeason };

		if (item.loading) {
			return (
				<div key={`${index}-emptyEpisode`} className={bem.e('loader')} style={{ height: itemHeight }}>
					<Spinner className={bem.e('spinner')} />
				</div>
			);
		}

		const selected = item.id === this.props.item.id;
		const { watched } = this.props;

		let currentProgress;
		if (selected) {
			currentProgress = this.props.currentProgress;
		} else if (watched && watched[item.id]) {
			currentProgress = getProgress(item, watched);
		}

		const classes = bem.e('episode', { selected });
		const thumbnailImage = get(item, 'images.tile') || '';
		const thumbnailStyle = { backgroundImage: `url("${thumbnailImage}")` };
		const indicatorStyle = { width: `${currentProgress}%` };

		return (
			<CTAWrapper key={item.id} type={CTATypes.Watch} data={{ item, entryPoint: VideoEntryPoint.SwitchEpisode }}>
				<VideoItemWrapper item={videoItem} selectedItem={selectedItem} entryPoint={VideoEntryPoint.SwitchEpisode}>
					<div className={classes} onClick={() => this.onEpisodeChange(item)}>
						<div className={bem.e('thumbnail')} style={thumbnailStyle}>
							{item.badge && <Badge item={item} className={bem.e('badge')} mod="packshot" />}
							<div className={bem.e('progress-bar', { show: currentProgress })}>
								<div className={bem.e('indicator')} style={indicatorStyle} />
							</div>
						</div>

						<div className={bem.e('details')}>
							<div className={bem.e('now-playing', { selected })}>
								<IntlFormatter elementType="span">{'@{now_playing_label|now playing}'}</IntlFormatter>
							</div>

							<div className={bem.e('name')}>{item.title}</div>

							<div className={bem.e('duration')}>
								<IntlFormatter elementType="span" values={{ minutes: Math.round(item.duration / 60) }}>
									{'@{itemDetail_labels_duration_minute|{minutes} mins}'}
								</IntlFormatter>
							</div>
						</div>
					</div>
				</VideoItemWrapper>
			</CTAWrapper>
		);
	};

	loadNextPage = pageNext => {
		const { getItemChildrenList } = this.props;
		const { currentSeason } = this.state;
		const options = {
			pageSize: PAGE_SIZE,
			page: pageNext,
			order: SortingOptions.Earliest
		};

		getItemChildrenList(currentSeason.id, options).then(data => {
			const items = get(data, 'payload.items');
			const from = (pageNext - 1) * PAGE_SIZE;
			const to = pageNext * PAGE_SIZE;
			const newItemsArray = this.state.items.map((item, index) => {
				if (index >= from && index < to) {
					return items.shift();
				}
				return item;
			});
			this.setState({ items: newItemsArray });
		});
	};

	onSignIn = item => {
		const { redirectPathAfterSignIn, config } = this.props;
		const path = redirectPathAfterSignIn || item.path;
		redirectToSignPage(config, path);
		fullscreenService.switchOffFullscreen();
	};

	onSubscribe = item => {
		const { config } = this.props;
		isContentProviderCeased(item) ? this.showCessationUpsellModal(item) : redirectToSubscriptions(item, config);
		fullscreenService.switchOffFullscreen();
	};

	private onCessationCancelClick = () => {
		const { closeModal } = this.props;
		closeModal(UPSELL_CESSATION_MODAL);
	};

	onConfirmModal = item => {
		const { closeModal, isSignedInUser } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		if (isSignedInUser) return this.onSubscribe(item);
		return this.onSignIn(item);
	};

	onCancelModal = () => {
		this.props.closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);
		this.props.toggleOverlayEpisodeSelector();
	};

	getSubscriptionsModalProps(item): SubscriptionsModalProps {
		return {
			onConfirm: () => this.onConfirmModal(item),
			onClose: this.onCancelModal,
			target: 'player',
			isSignedInUser: this.props.isSignedInUser
		};
	}

	onSeasonChange(season: api.ItemDetail) {
		getItem(season.id, { expand: 'all' }).then(response => {
			this.setState({
				items: new Array(response.data.availableEpisodeCount).fill({ loading: true }),
				currentSeason: response.data,
				showEpisodes: true
			});
		});
	}

	onEpisodeChange = (episode: api.ItemDetail) => {
		const { closeModal, onDissmiss, id, openModal, isSignedInUser, updateVideoEntryPoint } = this.props;

		this.setState({ noDissmissOnUnmount: true }, () => {
			closeModal(id);
			onDissmiss();

			this.getItemWithCache(episode.id).then(itemDetails => {
				if (canPlay(itemDetails)) {
					browserHistory.replace(itemDetails.watchPath);
					updateVideoEntryPoint(VideoEntryPoint.SwitchEpisode);
					return;
				} else {
					if (isRestrictedForAnonymous(episode)) {
						this.openRestrictionForAnonymousModal(episode);
						return;
					}
				}
				if (!isSignedInUser && !isRegistrationOnlyRequired(itemDetails)) {
					isContentProviderCeased(episode)
						? this.showCessationUpsellModal(itemDetails)
						: this.showUpsellModal(itemDetails);
					return;
				}
				isContentProviderCeased(episode)
					? this.showCessationUpsellModal(episode)
					: openModal(subscriptionRequiredModal(this.getSubscriptionsModalProps(itemDetails)));
			});
		});
	};

	private showUpsellModal = (episode: api.ItemDetail) => {
		const upsellModalProps: UpsellModalProps = {
			onSubscribe: () => this.onSubscribe(episode),
			onSignIn: () => this.onSignIn(episode),
			modalTarget: 'player'
		};
		this.props.openModal(upsellModal(upsellModalProps));
	};

	private showCessationUpsellModal = (episode: api.ItemDetail) => {
		const { openModal, isSignedInUser } = this.props;

		const upsellModalProps: UpsellModalProps = isSignedInUser
			? { onSubscribe: () => this.onCessationCancelClick() }
			: {
					onSubscribe: () => this.onCessationCancelClick(),
					onSignIn: () => this.onSignIn(episode)
			  };

		const provider = get(episode, 'customFields.Provider');
		openModal(upsellCessationModal(upsellModalProps, provider));
	};

	openRestrictionForAnonymousModal(episode) {
		const { getRestrictedContentModalForAnonymous } = this.props;
		getRestrictedContentModalForAnonymous(() => this.onSignIn(episode), () => this.onSubscribe(episode));
	}
}

const ignoredPageKeys = [Watch];
function mapStateToProps({ account, app, page, profile }: state.Root): OverlayEpisodeSelectorStateProps {
	const entries = get(page, 'history.entries');
	const redirectPathAfterSignIn = getLastPageInHistoryBeforeIgnored(entries, app.config, ignoredPageKeys);
	const watched = get(profile, 'info.watched');
	return {
		isSignedInUser: account && !!account.info,
		config: app.config,
		redirectPathAfterSignIn,
		watched
	};
}

function mapDispatchToProps(dispatch): OverlayEpisodeSelectorDispatchProps {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id)),
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		getItemChildrenList: (id: string, options: GetItemChildrenListOptions) =>
			dispatch(getItemChildrenList(id, options)),
		getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => {
			dispatch(OpenModal(getRestrictedModalForAnonymous(onSignIn, onSignUp)));
		},
		updateVideoEntryPoint: (entryPoint: VideoEntryPoint) =>
			dispatch({ type: UPDATE_PLAYER_ENTRY_POINT, payload: entryPoint })
	};
}

export default connect<
	OverlayEpisodeSelectorStateProps,
	OverlayEpisodeSelectorDispatchProps,
	OverlayEpisodeSelectorOwnProps
>(
	mapStateToProps,
	mapDispatchToProps
)(OverlayEpisodeSelector);
