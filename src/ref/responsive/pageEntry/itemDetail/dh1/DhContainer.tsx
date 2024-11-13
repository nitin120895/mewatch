import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';

import { getDefaultEpisode, resolveItemOrAncestor } from 'ref/responsive/pageEntry/itemDetail/util/itemProps';
import { getWatchedInfo, WatchedState } from 'shared/account/profileUtil';
import { toggleBookmark } from 'shared/account/profileWorkflow';
import { CTATypes } from 'shared/analytics/types/types';
import { setAppBackgroundImage } from 'shared/app/appWorkflow';
import { getNextPlaybackItem } from 'shared/service/action/profile';
import { noop } from 'shared/util/function';
import { resolveImages } from 'shared/util/images';
import { get } from 'shared/util/objects';
import { BREAKPOINT_RANGES } from '../../../util/grid';
import { canPlay } from '../../util/offer';
import { getTrailersFromProps } from '../util/itemProps';
import { getAnonNextPlaybackItem } from 'shared/service/action/content';

interface DHComponentProps extends PageEntryItemDetailProps {
	activeAccount: boolean;
	anchorItem?: api.ItemDetail;
	nextEpisode?: api.ItemDetail;
	isNextEpisodeChecking?: boolean;
	isDefaultEpisode?: boolean;
	nextSuggestionType?: string;
	getNextPlaybackItem: (itemId: string, subscriptionCode: string) => void;
	getAnonNextPlaybackItem: (itemId: string) => void;
	updateAppBackgroundImage: (sources: image.Source[], appWallpaperCssModifier?: string) => void;
	toggleBookmark: (item: api.ItemDetail) => void;
	subscriptionCode?: string;
	noPendingUpdates?: boolean;
}

interface DHComponentState {
	trailers: api.ItemSummary[];
}

interface ActionMetadata {
	label: string;
	onClick: (e) => void;
	type?: CTATypes.Default;
	data?: undefined;
}

type OfferAction = {
	label: string;
	onClick: (e) => void;
	type: CTATypes.Offer;
	data: { offer: api.Offer; item: api.ItemDetail; title: string };
};

type WatchAction = {
	label: string;
	onClick: (e) => void;
	type: CTATypes.Watch;
	data: { item: api.ItemDetail };
};

export type CTAAction = OfferAction | WatchAction | ActionMetadata;

type OfferActionMap = { [_ in api.OfferRights['ownership']]?: { label: string; onClick: (e: any) => void } };

export interface ResumePointData {
	resumePoint: number;
	duration: number;
	title: string;
}

const tabletBreakpoint = BREAKPOINT_RANGES['phablet'];
const desktopBreakpoint = BREAKPOINT_RANGES['desktop'];

const mobileBp = `(max-width: ${tabletBreakpoint.min - 1}px)`;
const tabletBp = `(min-width: ${tabletBreakpoint.min}px) and (max-width: ${desktopBreakpoint.min - 1}px)`;
const desktopBp = `(min-width: ${desktopBreakpoint.min}px)`;

export const DhContainer = WrappedComponent => {
	class DHComponent extends React.Component<DHComponentProps, DHComponentState> {
		state = {
			trailers: undefined
		};

		componentDidMount() {
			this.setBackgroundImage(this.props.anchorItem);
			this.checkNextItem();
			this.checkTrailers();
		}

		componentWillReceiveProps(nextProps: DHComponentProps) {
			if (nextProps.anchorItem !== this.props.anchorItem) {
				this.setBackgroundImage(nextProps.anchorItem);
			}
		}

		componentDidUpdate(prevProps) {
			const { item, noPendingUpdates, nextEpisode } = this.props;
			if (
				prevProps.item !== item ||
				(prevProps.noPendingUpdates !== noPendingUpdates && noPendingUpdates) ||
				(prevProps.nextEpisode && !nextEpisode)
			) {
				this.checkNextItem();
			}

			if (prevProps.item !== item) {
				this.checkTrailers();
			}
		}

		componentWillUnmount() {
			this.props.updateAppBackgroundImage(undefined);
		}

		private setBackgroundImage(anchorItem: api.ItemDetail) {
			if (!anchorItem) return;

			const { updateAppBackgroundImage } = this.props;
			const images = anchorItem.images;
			const mobile = resolveImages(images, 'wallpaper', { width: 480 })[0].src;
			const tablet = resolveImages(images, 'wallpaper', { width: 1440 })[0].src;
			const desktopWide = resolveImages(images, 'wallpaper', { width: 1920 })[0].src;
			updateAppBackgroundImage(
				[
					{ src: mobile, mediaQuery: mobileBp },
					{ src: tablet, mediaQuery: tabletBp },
					{ src: desktopWide, mediaQuery: desktopBp }
				],
				'dh1'
			);
		}

		private checkNextItem() {
			const {
				anchorItem,
				nextEpisode,
				getNextPlaybackItem,
				subscriptionCode,
				activeAccount,
				noPendingUpdates,
				getAnonNextPlaybackItem
			} = this.props;
			if (this.isShow() && !nextEpisode && noPendingUpdates) {
				if (activeAccount) {
					getNextPlaybackItem(anchorItem.id, subscriptionCode);
				} else {
					getAnonNextPlaybackItem(anchorItem.id);
				}
			}
		}

		private checkTrailers() {
			this.setState({
				trailers: getTrailersFromProps(this.props)
			});
		}

		private isShow() {
			const { anchorItem } = this.props;
			return !!anchorItem && anchorItem.type === 'show';
		}

		private getResumePoint(item: api.ItemDetail) {
			if (!item) return 0;
			const { activeAccount } = this.props;
			const watched = activeAccount && getWatchedInfo(item.id);
			return watched && watched.state !== WatchedState.Updating && watched.value && watched.value.position;
		}

		private getDefaultActionMetadata(): CTAAction {
			return { label: '', onClick: noop };
		}

		private getEpisodeActionMetadata(
			nextEpisode: api.ItemDetail,
			isDefault: boolean,
			nextSuggestionType: string
		): CTAAction {
			if (!nextEpisode) return this.getDefaultActionMetadata();

			const resume = this.getResumePoint(nextEpisode);
			return {
				label: resume
					? '@{itemDetail_labels_resume|Resume}'
					: isDefault || nextSuggestionType === 'StartWatching' || nextSuggestionType === 'RestartWatching'
					? '@{itemDetail_labels_watch|Watch}'
					: '@{itemDetail_labels_next_episode|Next Episode}',
				onClick: this.onClickEpisodeWatch,
				type: CTATypes.Watch,
				data: { item: nextEpisode }
			};
		}

		private getMovieActionMetadata(item: api.ItemDetail): CTAAction {
			if (!item) return this.getDefaultActionMetadata();

			const resume = this.getResumePoint(item);
			return {
				label: resume ? '@{itemDetail_labels_resume|Resume}' : '@{itemDetail_labels_watch|Watch}',
				onClick: this.onClickWatch,
				type: CTATypes.Watch,
				data: { item }
			};
		}

		private getOfferBasedActionMetadata(item: api.ItemDetail): CTAAction {
			const firstOffer = !!item && !!item.offers && item.offers[0];
			if (firstOffer) {
				const ownership = firstOffer.ownership;
				const { onClick, label } = this.offerActionMap[ownership in this.offerActionMap ? ownership : 'Own'];

				return {
					label,
					onClick,
					type: CTATypes.Offer,
					data: { offer: firstOffer, item, title: label }
				} as OfferAction;
			} else {
				return this.getDefaultActionMetadata();
			}
		}

		private getPrimaryActionData(): CTAAction {
			const { anchorItem, nextEpisode, isNextEpisodeChecking, isDefaultEpisode, nextSuggestionType } = this.props;
			let actionMetadata: CTAAction;
			if (this.isShow()) {
				if (isNextEpisodeChecking) {
					actionMetadata = this.getDefaultActionMetadata();
				} else if (canPlay(nextEpisode)) {
					actionMetadata = this.getEpisodeActionMetadata(nextEpisode, isDefaultEpisode, nextSuggestionType);
				} else {
					actionMetadata = this.getOfferBasedActionMetadata(nextEpisode);
				}
			} else if (canPlay(anchorItem)) {
				actionMetadata = this.getMovieActionMetadata(anchorItem);
			} else {
				actionMetadata = this.getOfferBasedActionMetadata(anchorItem);
			}

			return actionMetadata;
		}

		private getSeasonNumber() {
			const { nextEpisode, item } = this.props;
			// for episode from get next item API we have season number or use season number for default episode
			return get(nextEpisode, 'season.seasonNumber') || (item && item.seasonNumber);
		}

		private getDescription() {
			const { nextEpisode, anchorItem, nextSuggestionType } = this.props;

			// there is no description on item sometimes, let's use shortDescription in that case
			return nextEpisode &&
				nextSuggestionType &&
				(nextSuggestionType === 'ContinueWatching' || nextSuggestionType === 'Sequential')
				? nextEpisode.description || nextEpisode.shortDescription
				: anchorItem.description || anchorItem.shortDescription;
		}

		private doShowEpisodeMetadata() {
			const { nextSuggestionType } = this.props;
			return (nextSuggestionType && nextSuggestionType === 'ContinueWatching') || nextSuggestionType === 'Sequential';
		}

		private getResumePointData() {
			const { nextEpisode, anchorItem } = this.props;
			const { duration } = nextEpisode || anchorItem;
			const resumePoint = this.isShow() ? this.getResumePoint(nextEpisode) : this.getResumePoint(anchorItem);
			// For now title for progress bar for episodes on show detail page is deferred by designs
			const title = undefined;
			return { resumePoint, duration, title };
		}

		private onClickWatch = e => {
			const { anchorItem } = this.props;
			if (!anchorItem) return;

			browserHistory.push(anchorItem.watchPath);
		};

		private onClickEpisodeWatch = e => {
			const { nextEpisode } = this.props;
			if (!nextEpisode) return;

			browserHistory.push(nextEpisode.watchPath);
		};

		private onWatchTrailerAction = () => {
			const { trailers } = this.state;
			if (trailers && trailers.length > 0) {
				browserHistory.push(trailers[0].watchPath);
			}
		};

		private onToggleBookmark = () => {
			const { anchorItem, toggleBookmark } = this.props;
			toggleBookmark(anchorItem);
		};

		private onClickSubscribe = e => {
			// Stub
		};

		private onClickPurchase = e => {
			// Stub
		};

		private onClickRent = e => {
			// Stub
		};

		private offerActionMap: OfferActionMap = {
			Subscription: { label: '@{itemDetail_labels_subscribe|Subscribe}', onClick: this.onClickSubscribe },
			Rent: { label: '@{itemDetail_labels_rent|Rent}', onClick: this.onClickRent },
			Own: { label: '@{itemDetail_labels_buy|Buy}', onClick: this.onClickPurchase }
		};

		render() {
			const { anchorItem, nextEpisode, isNextEpisodeChecking } = this.props;
			const primaryActionData = this.getPrimaryActionData();

			return (
				<WrappedComponent
					{...this.props}
					anchorItem={anchorItem}
					nextEpisode={nextEpisode}
					trailers={this.state.trailers}
					loading={isNextEpisodeChecking}
					primaryAction={primaryActionData}
					toggleBookmarkAction={this.onToggleBookmark}
					watchTrailerAction={this.onWatchTrailerAction}
					resumePointData={this.getResumePointData()}
					seasonNumber={this.getSeasonNumber()}
					description={this.getDescription()}
					showEpisodeMetadata={this.doShowEpisodeMetadata()}
				/>
			);
		}
	}

	function mapStateToProps({ cache, account, profile }: state.Root, ownProps: any) {
		const item = resolveItemOrAncestor(ownProps);
		const subscriptionCode = get(account, 'info.subscriptionCode') || '';
		const activeAccount = account.active;
		const pendingUpdates = profile.info && profile.info.pendingUpdates;
		const noPendingUpdates = !pendingUpdates || pendingUpdates.length === 0;

		let nextEpisode;
		let isNextEpisodeChecking;
		let isDefaultEpisode;
		let nextSuggestionType;

		if (item && item.type === 'show') {
			const next = cache.nextItem && cache.nextItem[item.id];
			if (next && next.checked) {
				if (next.item) {
					nextEpisode = next.item;
					nextSuggestionType = next.suggestionType;
				} else {
					nextEpisode = getDefaultEpisode(ownProps);
					isDefaultEpisode = true;
				}
			}
			isNextEpisodeChecking = !nextEpisode;
		}

		return {
			anchorItem: item,
			nextEpisode,
			isNextEpisodeChecking,
			isDefaultEpisode,
			subscriptionCode,
			activeAccount,
			noPendingUpdates,
			nextSuggestionType
		};
	}

	function mapDispatchToProps(dispatch) {
		return {
			getNextPlaybackItem: (itemId: string, subscriptionCode: string) => {
				dispatch(
					getNextPlaybackItem(itemId, { device: 'web_browser', expand: 'parent', sub: subscriptionCode }, { itemId })
				);
			},
			getAnonNextPlaybackItem: (itemId: string) => {
				dispatch(getAnonNextPlaybackItem(itemId, { device: 'web_browser', expand: 'parent' }, { itemId }));
			},
			updateAppBackgroundImage: (sources, appWallpaperCssModifier) => {
				dispatch(setAppBackgroundImage(sources, appWallpaperCssModifier));
			},
			toggleBookmark: (item: api.ItemDetail) => {
				dispatch(toggleBookmark(item));
			}
		};
	}

	const Component: any = connect<any, any, DHComponentProps>(
		mapStateToProps,
		mapDispatchToProps
	)(DHComponent);
	return Component;
};
