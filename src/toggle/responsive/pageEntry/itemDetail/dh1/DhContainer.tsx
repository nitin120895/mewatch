import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';
import {
	BookmarkState,
	getBookmark,
	getWatchedInfo,
	WatchedState,
	PROMISED_BOOKMARK_KEY
} from 'shared/account/profileUtil';
import { resolveItemOrAncestor, getDefaultEpisode } from 'ref/responsive/pageEntry/itemDetail/util/itemProps';
import { getNextPlaybackItem } from 'shared/service/action/profile';
import { get } from 'shared/util/objects';
import { noop } from 'shared/util/function';
import { toggleBookmark } from 'shared/account/profileWorkflow';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { CTATypes } from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { setAppBackgroundImage } from 'shared/app/appWorkflow';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { resolveImages } from 'shared/util/images';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { getTrailersFromProps } from 'ref/responsive/pageEntry/itemDetail/util/itemProps';
import { redirectToSubscriptions } from '../../subscription/subscriptionsUtils';
import { getSignInPath } from 'shared/page/sitemapLookup';
import { getAnonymousNextPlaybackItem as getAnonNextPlaybackItem } from 'shared/service/action/content';
import { getActiveSubscriptions } from '../../account/accountUtils';
import {
	OfferAction,
	OfferActionMap,
	canPlay,
	isRegistrationOnlyRequired
} from 'toggle/responsive/pageEntry/util/offer';
import { isItemRestricted, isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import {
	getRestrictedModalForAnonymous,
	getRequiredModalForAnonymous,
	getSignInRequiredModalForAnonymous,
	REQUIRE_MODAL_ID
} from 'toggle/responsive/player/playerModals';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { onPlayerSignUp } from 'toggle/responsive/util/playerUtil';
import { ShowDetail as ShowDetailPageKey } from 'shared/page/pageKey';
import { ItemDetailTemplates } from 'shared/page/pageTemplate';
import { setItem } from 'shared/util/sessionStorage';
import {
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';
import { isEpisode } from 'ref/responsive/util/item';

interface OwnProps extends PageEntryItemDetailProps {}

interface StateProps {
	account: api.Account;
	config: state.Config;
	isSignedIn: boolean;
	anchorItem?: api.ItemDetail;
	nextEpisode?: api.ItemDetail;
	isNextEpisodeChecking?: boolean;
	isDefaultEpisode?: boolean;
	nextSuggestionType?: string;
	subscriptionCode?: string;
	noPendingUpdates?: boolean;
	activeSubscriptionCodes: string[];
	showPartnerLogo?: boolean;
}

interface DispatchProps {
	getNextPlaybackItem: (itemId: string, subscriptionCode: string) => void;
	getAnonNextPlaybackItem: (itemId: string) => void;
	updateAppBackgroundImage: (sources: image.Source[], appWallpaperCssModifier?: string) => void;
	getRestrictedContentModal: (onSignIn: () => void, onSIgnUp: () => void) => void;
	getRequiredModal: (onSignIn: () => void, onCancel: () => void) => void;
	getSignInRequiredModal: (onSignIn: () => void, onSIgnUp: () => void) => void;
	closeModal: (id: string) => void;
	toggleBookmark: (item: api.ItemDetail) => void;
	sendBookmarkAnalyticsEvent: (addToList: boolean, item: api.ItemDetail) => void;
	subscriptionCode?: string;
	noPendingUpdates?: boolean;
	openModal: typeof OpenModal;
	updateSubscriptionEntryPoint: (entryPoint) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
	trailers: api.ItemSummary[];
}

interface ActionMetadata {
	label: string;
	onClick: (e) => void;
	type?: CTATypes.Default;
	data?: undefined;
}

type WatchAction = {
	label: string;
	onClick: (e) => void;
	type: CTATypes.Watch;
	data: { item: api.ItemDetail };
};

export type CTAAction = OfferAction | WatchAction | ActionMetadata;

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

const mobileDefaultBackground = require('../../../../../../resource/toggle/image/defaultBackground/generic-wallpaper.jpg');
const tabletDefaultBackground = require('../../../../../../resource/toggle/image/defaultBackground/generic-wallpaper@2x.jpg');
const desktopWideDefaultBackground = require('../../../../../../resource/toggle/image/defaultBackground/generic-wallpaper@3x.jpg');

export const DhContainer = WrappedComponent => {
	class DHComponent extends React.Component<Props, State> {
		state = {
			trailers: undefined
		};

		componentDidMount() {
			this.setBackgroundImage(this.props.anchorItem);
			this.checkNextItem();
			this.checkTrailers();
		}

		componentWillReceiveProps(nextProps: Props) {
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

			const imagesAvailable = images && images.wallpaper;
			const isDefaultPlaceholder = !imagesAvailable;
			updateAppBackgroundImage(
				[
					{ src: imagesAvailable ? mobile : mobileDefaultBackground, mediaQuery: mobileBp, isDefaultPlaceholder },
					{ src: imagesAvailable ? tablet : tabletDefaultBackground, mediaQuery: tabletBp, isDefaultPlaceholder },
					{
						src: imagesAvailable ? desktopWide : desktopWideDefaultBackground,
						mediaQuery: desktopBp,
						isDefaultPlaceholder
					}
				],
				'dh1'
			);
		}

		private checkNextItem() {
			const {
				item,
				anchorItem,
				nextEpisode,
				getNextPlaybackItem,
				subscriptionCode,
				isSignedIn,
				noPendingUpdates,
				getAnonNextPlaybackItem
			} = this.props;
			if (!!item && this.isShow() && !nextEpisode && noPendingUpdates) {
				if (isSignedIn) {
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
			const watched = getWatchedInfo(item.id);
			return watched && watched.state !== WatchedState.Updating && watched.value && watched.value.position;
		}

		private getDefaultActionMetadata(): CTAAction {
			return { label: '', onClick: noop };
		}

		private getDefaultCessationActionMetadata(provider): CTAAction {
			return { label: provider, onClick: noop };
		}

		private getEpisodeActionMetadata(item: api.ItemDetail, isDefault: boolean, nextSuggestionType: string): CTAAction {
			if (!item) return this.getDefaultActionMetadata();
			const canResume = this.getResumePoint(item) || !this.shouldShowWatchLabel(isDefault, nextSuggestionType);
			return {
				label: canResume ? '@{itemDetail_labels_resume|Resume}' : '@{itemDetail_labels_watch|Watch}',
				onClick: () =>
					isContentProviderCeased(item) && !canPlay(item)
						? this.showCessationUpsellModal()
						: this.onClickEpisodeWatch(item),
				type: CTATypes.Watch,
				data: { item }
			};
		}

		private shouldShowWatchLabel(isDefault: boolean, nextSuggestionType: string): boolean {
			const { resumePoint } = this.getResumePointData();
			return (
				!resumePoint &&
				(isDefault || nextSuggestionType === 'StartWatching' || nextSuggestionType === 'RestartWatching')
			);
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
			const { account } = this.props;
			const firstOffer = !!item && !!item.offers && item.offers[0];
			const provider = get(item, 'customFields.Provider');

			if (firstOffer && isContentProviderCeased(item) && account) {
				return this.getDefaultCessationActionMetadata(provider);
			}
			if (firstOffer) {
				const { onClick, label } = this.getOfferAction(item);
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
			const {
				anchorItem,
				nextEpisode,
				isNextEpisodeChecking,
				isDefaultEpisode,
				nextSuggestionType,
				item,
				account
			} = this.props;

			let actionMetadata: CTAAction;
			const provider = get(item, 'customFields.Provider');

			if (isContentProviderCeased(item) && !canPlay(item) && account) {
				actionMetadata = this.getDefaultCessationActionMetadata(provider);
			} else if (this.isShow()) {
				if (isNextEpisodeChecking) {
					actionMetadata = this.getDefaultActionMetadata();
				} else if (isEpisode(item)) {
					actionMetadata = this.getEpisodeActionMetadata(item, isDefaultEpisode, nextSuggestionType);
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
			const { anchorItem, getRestrictedContentModal, account } = this.props;
			if (!anchorItem) return;

			if (isItemRestricted(anchorItem) && !account) {
				getRestrictedContentModal(this.onSignInClick, () => onPlayerSignUp());
			} else {
				browserHistory.push(anchorItem.watchPath);
			}
		};

		private onClickEpisodeWatch = (item: api.ItemSummary) => {
			const { getRestrictedContentModal, account } = this.props;
			if (!item) return;

			if (isItemRestricted(item) && !account) {
				getRestrictedContentModal(this.onSignInClick, () => onPlayerSignUp());
			} else {
				browserHistory.push(item.watchPath);
			}
		};

		private onWatchTrailerAction = () => {
			const { trailers } = this.state;
			if (trailers && trailers.length > 0) {
				browserHistory.push(trailers[0].watchPath);
			}
		};

		private onToggleBookmark = () => {
			const { activeProfile, item, pageKey, toggleBookmark, getRequiredModal, sendBookmarkAnalyticsEvent } = this.props;
			const itemToBookmark = resolveItemOrAncestor(this.props);
			const watchList = getBookmark(itemToBookmark.id);
			const addedToList = watchList && watchList.state === BookmarkState.Bookmarked;

			// Needed as Show Detail page returns item as season instead of show
			const analyticsEventItem = pageKey === ShowDetailPageKey ? itemToBookmark : item;
			sendBookmarkAnalyticsEvent(addedToList, analyticsEventItem);

			if (activeProfile) {
				toggleBookmark(itemToBookmark);
			} else {
				getRequiredModal(this.onBookmarkSignInClick, this.onClose);
			}
		};

		private onClose = () => {
			this.props.closeModal(REQUIRE_MODAL_ID);
		};

		onBookmarkSignInClick = () => {
			setItem(PROMISED_BOOKMARK_KEY, resolveItemOrAncestor(this.props));
			this.onSignInClick();
		};

		onSignInClick = () => {
			browserHistory.push(`/${getSignInPath(this.props.config)}`);
		};

		private onClickSubscribe = () => {
			const { item, config, updateSubscriptionEntryPoint } = this.props;
			updateSubscriptionEntryPoint(MixpanelEntryPoint.IDPSubscribe);
			redirectToSubscriptions(item, config);
		};

		private onCessationCancelClick = () => {
			const { closeModal } = this.props;
			closeModal(UPSELL_CESSATION_MODAL);
		};

		private getOfferAction(item: api.ItemDetail): OfferActionMap {
			if (this.props.account) {
				return {
					label: '@{itemDetail_labels_subscribe|Subscribe}',
					onClick: this.onClickSubscribe
				};
			}
			const registrationRequired = isRegistrationOnlyRequired(item);

			if (registrationRequired && isItemRestricted(item)) {
				return {
					label: '@{itemDetail_labels_watch|Watch}',
					onClick: isContentProviderCeased(item) ? this.showCessationUpsellModal : this.showRestrictedModal
				};
			}

			if (registrationRequired) {
				return {
					label: '@{itemDetail_labels_watch|Watch}',
					onClick: isContentProviderCeased(item) ? this.showCessationUpsellModal : this.showSignInRequiredModal
				};
			}

			return {
				label: '@{itemDetail_labels_watch|Watch}',
				onClick: isContentProviderCeased(item) ? this.showCessationUpsellModal : this.showUpsellModal
			};
		}

		private showRestrictedModal = () => {
			this.props.getRestrictedContentModal(this.onSignInClick, () => onPlayerSignUp());
		};
		private showCessationUpsellModal = () => {
			const { openModal, isSignedIn, item } = this.props;
			const upsellModalProps: UpsellModalProps = isSignedIn
				? { onSubscribe: () => this.onCessationCancelClick() }
				: {
						onSubscribe: () => this.onCessationCancelClick(),
						onSignIn: () => this.onSignInClick()
				  };
			const provider = get(item, 'customFields.Provider');
			openModal(upsellCessationModal(upsellModalProps, provider));
		};

		private showUpsellModal = () => {
			const upsellModalProps: UpsellModalProps = {
				onSubscribe: () => this.onClickSubscribe(),
				onSignIn: () => this.onSignInClick()
			};
			this.props.openModal(upsellModal(upsellModalProps));
		};

		private showSignInRequiredModal = () => {
			const { getSignInRequiredModal } = this.props;
			getSignInRequiredModal(this.onSignInRequiredConfirm, () => onPlayerSignUp());
		};

		private onSignInRequiredConfirm = () => {
			const { closeModal } = this.props;
			closeModal(REQUIRE_MODAL_ID);
			return this.onSignInClick();
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

	function mapStateToProps({ cache, account, profile, app, page }: state.Root, ownProps: any): StateProps {
		const item = resolveItemOrAncestor(ownProps);
		const subscriptionCode = get(account, 'info.subscriptionCode') || '';
		const isSignedIn = account.active;
		const pendingUpdates = profile.info && profile.info.pendingUpdates;
		const noPendingUpdates = !pendingUpdates || pendingUpdates.length === 0;
		const pageTemplate = get(page, 'history.pageSummary.template');
		const isItemDetailsPage = pageTemplate && ItemDetailTemplates.includes(pageTemplate);

		const showPartnerLogo = isItemDetailsPage ? get(app, 'config.general.customFields.ShowPartnerLogo') : 1;

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

		const subscriptions = get(account, 'info.subscriptions');
		const activeSubscriptionCodes =
			subscriptions && getActiveSubscriptions(subscriptions).map(subscription => subscription.planId);

		return {
			account: account.info,
			config: app.config,
			anchorItem: item,
			nextEpisode,
			isNextEpisodeChecking,
			isDefaultEpisode,
			subscriptionCode,
			isSignedIn,
			noPendingUpdates,
			nextSuggestionType,
			showPartnerLogo: !!showPartnerLogo,
			activeSubscriptionCodes
		};
	}

	function mapDispatchToProps(dispatch): DispatchProps {
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
			},
			sendBookmarkAnalyticsEvent: (addedToList, item) => {
				const bookmarkEvent = addedToList
					? AnalyticsEventType.ITEM_BOOKMARK_REMOVE_CLICKED
					: AnalyticsEventType.ITEM_BOOKMARK_ADD_CLICKED;

				dispatch(analyticsEvent(bookmarkEvent, { item }));
			},
			getRestrictedContentModal: (onSignIn: () => void, onSIgnUp: () => void) => {
				dispatch(OpenModal(getRestrictedModalForAnonymous(onSignIn, onSIgnUp)));
			},
			getRequiredModal: (onSignIn: () => void, onCancel: () => void) => {
				dispatch(OpenModal(getRequiredModalForAnonymous(onSignIn, onCancel)));
			},
			getSignInRequiredModal: (onSignIn: () => void, onSIgnUp: () => void) => {
				dispatch(OpenModal(getSignInRequiredModalForAnonymous(onSignIn, onSIgnUp)));
			},
			openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
			closeModal: (id: string) => dispatch(CloseModal(id)),
			updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
		};
	}

	const Component: any = connect<StateProps, DispatchProps, OwnProps>(
		mapStateToProps,
		mapDispatchToProps
	)(DHComponent);
	return Component;
};
