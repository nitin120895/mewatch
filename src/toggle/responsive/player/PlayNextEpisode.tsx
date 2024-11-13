import * as React from 'react';
import { connect } from 'react-redux';
import TimerCircle from 'ref/responsive/player/controls/TimerCircle';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { canPlay, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { getNextItem } from 'shared/app/playerWorkflow';
import { wasActiveWithin } from 'shared/app/userActivityMonitor';
import Image from 'shared/component/Image';
import { getNextItemFromXT1 } from 'shared/list/listWorkflow';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';

import { OpenModal, CloseModal, HideAllModals } from 'shared/uiLayer/uiLayerWorkflow';
import { browserHistory } from 'shared/util/browserHistory';
import { Watch } from 'shared/page/pageKey';
import { getLastPageInHistoryBeforeIgnored, setRedirectPathAfterSignin } from 'shared/page/pageUtil';
import {
	subscriptionRequiredModal,
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	SubscriptionsModalProps,
	UpsellModalProps,
	upsellModal
} from '../util/subscriptionUtil';
import {
	redirectToSubscriptions,
	redirectToSignPage,
	redirectToRegisterPage
} from '../pageEntry/subscription/subscriptionsUtils';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import {
	getRestrictedModalForAnonymous,
	getRestrictedContentModal as getUnderAgeContentModal,
	getSignInRequiredModalForAnonymous
} from 'toggle/responsive/player/playerModals';
import { isSeriesEpisode } from '../util/item';
import { getAllowedToWatchAge, isItemRestricted } from '../util/playerUtil';
import { getClickToPlayWatchPath } from '../page/item/itemUtil';

import './PlayNextEpisode.scss';
const bem = new Bem('play-next-episode');

interface OwnProps {
	itemId: string;
	isShortVideo?: boolean;
	chainPlayCountdown: number;
	playerId: string;
	onFailed: () => void;
	onPlayNext: PlayNextHandler;
	isPaused?: boolean;
	isCountdownHidden?: boolean;
	activeAccount?: boolean;
	shouldRenderEndingCredits?: boolean;
	onSkipEndingCredits?: () => void;
	xt1ChainPlayList?: number | string;
}

interface StateProps {
	sub?: string;
	nextItem: api.ItemDetail;
	error: boolean;
	chainPlayTimeout: number;
	segments: string[];
	config: api.AppConfig;
	redirectPathAfterSignIn?: string;
}

interface DispatchProps {
	getNextItem: typeof getNextItem;
	getNextItemFromXT1: (site: string, itemId: string, key: number | string) => void;
	openModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	hideAllModals: () => void;
	getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => void;
	getUnderAgeContentModal: (item) => void;
	getSignInRequiredModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => void;
	updateSubscriptionEntryPoint: (entryPoint) => void;
}

type Props = OwnProps & DispatchProps & StateProps;

export class PlayNextEpisode extends React.Component<Props> {
	private chainPlayCountdownRemainingTime = Infinity;
	state = {
		showTimer: true
	};
	componentDidMount() {
		const { error, itemId } = this.props;
		if (error) return this.props.onFailed();

		if (!this.hasNext()) this.loadNextItem(itemId);
	}

	componentWillReceiveProps(nextProps: Props) {
		const { error, onFailed, itemId } = this.props;

		if (nextProps.error !== error && nextProps.error) {
			onFailed();
		}

		if (nextProps.itemId !== itemId) {
			this.setState({ next: undefined }, () => this.loadNextItem(nextProps.itemId));
		}
	}

	componentDidUpdate(prevProps: StateProps) {
		const { nextItem, redirectPathAfterSignIn, isCountdownHidden, xt1ChainPlayList, isShortVideo } = this.props;

		if (nextItem && prevProps.redirectPathAfterSignIn === redirectPathAfterSignIn) {
			if (isShortVideo) {
				if (!this.canPlayItem()) {
					this.openRestrictedModal();
				} else {
					this.onPlayNext();
				}
			}
			if (isCountdownHidden) {
				if (!this.canPlayItem()) {
					this.openRestrictedModal();
				} else if (!!xt1ChainPlayList) {
					this.onFinish();
				}
			}
		}
	}

	onConfirm = item => {
		const { closeModal, activeAccount } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		if (activeAccount) {
			return this.onSubscribe(item);
		}
		const redirectToNextEpisode = true;
		return this.onSignIn(redirectToNextEpisode);
	};

	getNextPath = item => (!!this.props.xt1ChainPlayList ? getClickToPlayWatchPath(item) : item && item.path);

	onSignIn = (redirectToNextEpisode?: boolean) => {
		const { redirectPathAfterSignIn, config, nextItem } = this.props;
		const redirectPath = redirectToNextEpisode ? this.getNextPath(nextItem) : redirectPathAfterSignIn;
		redirectToSignPage(config, redirectPath);
		fullscreenService.switchOffFullscreen();
	};

	onSignUp = (redirectToNextEpisode?: boolean) => {
		const { redirectPathAfterSignIn, config, nextItem } = this.props;
		const redirectPath = redirectToNextEpisode ? this.getNextPath(nextItem) : redirectPathAfterSignIn;
		setRedirectPathAfterSignin(redirectPath);
		redirectToRegisterPage(config);
		fullscreenService.switchOffFullscreen();
	};

	onSubscribe = item => {
		redirectToSubscriptions(item, this.props.config);
		fullscreenService.switchOffFullscreen();
	};

	openRestrictedModal() {
		const { nextItem, updateSubscriptionEntryPoint } = this.props;
		if (isRegistrationOnlyRequired(nextItem) && isItemRestricted(nextItem)) {
			this.openRestrictionModal();
		} else {
			updateSubscriptionEntryPoint(MixpanelEntryPoint.PlayNext);
			this.openSubscriptionModal(nextItem);
		}
	}

	openSubscriptionModal(item) {
		const { openModal, activeAccount } = this.props;
		fullscreenService.switchOffFullscreen();

		if (isRegistrationOnlyRequired(item)) {
			return this.props.getSignInRequiredModalForAnonymous(() => this.onSignIn(true), () => this.onSignUp(true));
		} else if (!activeAccount) {
			return this.showUpsellModal(item);
		}

		const props: SubscriptionsModalProps = {
			onConfirm: () => this.onConfirm(item),
			onClose: () => this.onClose(item),
			target: 'app',
			isSignedInUser: activeAccount
		};

		openModal(subscriptionRequiredModal(props));
	}

	openRestrictionModal() {
		const { getRestrictedContentModalForAnonymous, getUnderAgeContentModal, activeAccount, nextItem } = this.props;
		if (activeAccount) {
			getUnderAgeContentModal(nextItem);
		} else {
			getRestrictedContentModalForAnonymous(() => this.onSignIn(true), () => this.onSignUp(true));
		}
	}

	private onClose(item) {
		this.props.hideAllModals();
		if (this.props.xt1ChainPlayList) {
			browserHistory.goBack();
			return;
		}
		browserHistory.push(item.path);
	}

	private showUpsellModal = item => {
		const upsellModalProps: UpsellModalProps = {
			onSubscribe: () => this.onSubscribe(item),
			onSignIn: () => this.onSignIn(true),
			onClose: () => this.onClose(item),
			closeOnCancel: false,
			disableAutoClose: true
		};
		this.props.openModal(upsellModal(upsellModalProps));
	};

	loadNextItem(itemId: string) {
		const { getNextItem, playerId, sub, xt1ChainPlayList, getNextItemFromXT1 } = this.props;
		if (xt1ChainPlayList) {
			getNextItemFromXT1(playerId, itemId, xt1ChainPlayList);
		} else {
			getNextItem(itemId, playerId, sub);
		}
	}

	hasNext() {
		return !!this.props.nextItem;
	}

	canPlayItem() {
		const { nextItem } = this.props;
		return !!nextItem && canPlay(nextItem);
	}

	isCountdownAllowed() {
		const { chainPlayTimeout, isCountdownHidden } = this.props;
		const { showTimer } = this.state;
		return !isCountdownHidden && wasActiveWithin(chainPlayTimeout * 60 * 1000) && showTimer;
	}

	onCountdownTick = time => {
		this.chainPlayCountdownRemainingTime = time;
	};

	onPlayNext = () => {
		const { onPlayNext, nextItem } = this.props;

		if (this.canPlayItem()) {
			onPlayNext(nextItem, this.canPlayItem(), this.chainPlayCountdownRemainingTime);
		} else {
			// Hide timer after modal is shown
			this.setState({ showTimer: false });
			this.openRestrictedModal();
		}
	};

	onFinish = () => {
		const { shouldRenderEndingCredits, onSkipEndingCredits } = this.props;

		if (shouldRenderEndingCredits && onSkipEndingCredits) {
			onSkipEndingCredits();
		} else {
			this.onPlayNext();
		}
	};

	renderEpisodeMetadata() {
		const { nextItem } = this.props;

		return isSeriesEpisode(nextItem) ? (
			<IntlFormatter
				elementType="h2"
				className={bem.e('h2-title-text')}
				values={{
					seasonNumber: get(nextItem, 'season.seasonNumber') || nextItem.seasonNumber,
					episodeNumber: nextItem.episodeNumber,
					episodeName: nextItem.episodeName
				}}
			>
				{`@{endOfPlayback_metadata_title}`}
			</IntlFormatter>
		) : (
			<h2 className={bem.e('h2-title-text')}>{nextItem.episodeName}</h2>
		);
	}

	render() {
		if (!this.hasNext()) return false;

		const { chainPlayCountdown, nextItem, isPaused, isShortVideo } = this.props;
		const { images } = nextItem;
		const thumbnail = images && (images.tile || images.wallpaper);

		/* tslint:disable-next-line:no-null-keyword */
		if (isShortVideo) return null;

		return (
			<div className={bem.b()}>
				{thumbnail && (
					<div className={bem.e('thumbnail')} onClick={this.onPlayNext}>
						<CTAWrapper type={CTATypes.Watch} data={{ item: nextItem, entryPoint: VideoEntryPoint.PlayNext }}>
							<Image src={thumbnail} className={bem.e('thumbnail-img')} />
						</CTAWrapper>
					</div>
				)}
				<div className={bem.e('meta')}>
					<IntlFormatter className={bem.e('h1-title-text')} elementType="h1">
						{'@{next_episode|Next episode}'}
					</IntlFormatter>
					<div className={bem.e('meta-title')}>{this.renderEpisodeMetadata()}</div>
					{this.isCountdownAllowed() && (
						<div className={bem.e('countdown')}>
							<div className={bem.e('countdown-block')}>
								<IntlFormatter elementType="p" className={bem.e('countdown-text')}>
									{'@{next_episode_starting|Starting in}'}
								</IntlFormatter>
								<TimerCircle
									startFrom={chainPlayCountdown}
									onFinish={this.onFinish}
									onTick={this.onCountdownTick}
									isPaused={isPaused}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root, ownProps): StateProps {
	const { player, account, app, page } = state;
	const { contentFilters, config } = app;
	const players = player.players;
	const subscriptionCode = (account && account.info && account.info.subscriptionCode) || '';
	const { playerId } = ownProps;
	const { chainPlayTimeout } = config.playback;
	const nextItem = players && players[playerId] && players[playerId].nextItem;
	const entries = get(page, 'history.entries');
	const redirectPathAfterSignIn = getLastPageInHistoryBeforeIgnored(entries, config, [Watch]);

	return {
		sub: subscriptionCode,
		nextItem,
		error: players && players[playerId] && players[playerId].nextItemError,
		chainPlayTimeout: chainPlayTimeout || 0,
		segments: contentFilters.segments,
		config,
		redirectPathAfterSignIn
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getNextItem: (itemId: string, playerId: string, sub: string, segments?: string[]) => {
			return dispatch(getNextItem(itemId, playerId, sub));
		},
		getNextItemFromXT1: (site: string, itemId: string, key: number | string) =>
			dispatch(getNextItemFromXT1(site, itemId, key)),
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		hideAllModals: () => dispatch(HideAllModals()),
		getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) =>
			dispatch(OpenModal(getRestrictedModalForAnonymous(onSignIn, onSignUp))),
		getUnderAgeContentModal: item =>
			dispatch(OpenModal(getUnderAgeContentModal(undefined, getAllowedToWatchAge(item)))),
		getSignInRequiredModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) =>
			dispatch(OpenModal(getSignInRequiredModalForAnonymous(onSignIn, onSignUp))),
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(PlayNextEpisode);
