import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { FormattedTime } from 'react-intl';
import { Bem } from 'shared/util/styles';
import Picture from 'shared/component/Picture';
import Spinner from 'ref/responsive/component/Spinner';
import LiveProgress from '../../../component/LiveProgress';
import { resolveChannelLogo, resolveItemImage } from '../../../util/epg';
import { get } from 'shared/util/objects';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { SCHEDULE_DETAIL_OVERLAY_MODAL_ID } from '../../epg/EPG2';
import { EPG2ItemState } from '../../../util/epg';
import ScheduleDetailOverlay, { ScheduleDetailOverlayOwnProps } from '../../epg/ScheduleDetailOverlay';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OpenModal, ToggleContent, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { fallbackURI } from 'shared/util/images';
import { goToChannel, onPlayerSignUp, isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { isEdgeSpartan } from 'shared/util/browser';
import { isOnNow } from 'toggle/responsive/util/channelUtil';
import { getUpdatedItem } from '../../../page/item/itemUtil';
import Badge from 'toggle/responsive/component/Badge';
import PartnerLogo from 'toggle/responsive/component/PartnerLogo';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import { isSignedIn } from 'shared/account/accountUtil';
import { wrapLinear } from 'shared/analytics/components/ItemWrapper';
import { getSignInRequiredModalForAnonymous } from 'toggle/responsive/player/playerModals';
import {
	getUserActionRequirement,
	redirectToSignPage,
	redirectToSubscriptions,
	USER_REQUIREMENT
} from '../../subscription/subscriptionsUtils';
import {
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	subscriptionRequiredModal,
	SubscriptionsModalProps,
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';
import { getItemWithCacheCreator } from 'shared/util/itemUtils';

import '../components/EpgItemImage.scss';

const bem = new Bem('epg-image');

interface OwnProps {
	schedule: api.ItemSchedule;
	loading: boolean;
	className?: string;
	customFields?: any;
	first?: boolean;
	channel?: api.ItemSummary;
	item?: api.ItemSchedule;
	index?: number;
	totalScheduleCount?: number;
}

interface StateProps {
	currentPath: string;
	useAmPmTimeFormat: boolean;
	config: api.AppConfig;
	account: state.Account;
}

interface DispatchProps {
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	hideContent: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class Chd2ItemImage extends React.PureComponent<Props> {
	static contextTypes: any = {
		entry: PropTypes.object.isRequired
	};
	context: { entry: PageEntryPropsBase };

	getItemWithCache = getItemWithCacheCreator();

	private onClick = () => {
		const { first, channel, currentPath } = this.props;

		if (first) {
			this.getItemWithCache(channel.id).then(item => {
				if (!canPlay(item)) {
					this.openSubscriptionRequiredModal(item);
				} else {
					if (isEdgeSpartan()) {
						const contentEl = document.querySelector('.content');
						this.props.hideContent();
						fullscreenService.setFullScreenElement(contentEl);
						fullscreenService.switchOnFullscreen();
					}
					goToChannel(item, currentPath);
				}
			});
		} else {
			this.openScheduleDetailModal();
		}
	};

	private openSubscriptionRequiredModal = item => {
		const { showModal, account, config } = this.props;
		const isSignedInUser = isSignedIn(account);
		const provider = get(item, 'customFields.Provider');
		const nextAction = getUserActionRequirement(isSignedInUser, item);

		if (nextAction === USER_REQUIREMENT.UPSELL) {
			const upsellModalProps: UpsellModalProps = {
				onSubscribe: () => redirectToSubscriptions(item, config),
				onSignIn: () => this.onSignIn()
			};
			const upsellCessationModalProps: UpsellModalProps = isSignedInUser
				? { onSubscribe: () => this.onCessationCancelClick() }
				: {
						onSubscribe: () => this.onCessationCancelClick(),
						onSignIn: () => this.onSignIn()
				  };
			return isContentProviderCeased(item)
				? showModal(upsellCessationModal(upsellCessationModalProps, provider))
				: showModal(upsellModal(upsellModalProps));
		} else if (nextAction === USER_REQUIREMENT.SIGNIN_REQUIRED) {
			return showModal(getSignInRequiredModalForAnonymous(this.onSignIn, () => onPlayerSignUp(item && item.path)));
		}

		const props: SubscriptionsModalProps = {
			onConfirm: this.onConfirmModal,
			target: 'app',
			isSignedInUser
		};

		isContentProviderCeased(item)
			? showModal(upsellCessationModal({ onSubscribe: () => this.onCessationCancelClick() }, provider))
			: showModal(subscriptionRequiredModal(props));
	};

	private onSignIn = () => {
		const { config, channel } = this.props;
		redirectToSignPage(config, channel.path);
	};

	private onCessationCancelClick = () => {
		const { closeModal } = this.props;
		closeModal(UPSELL_CESSATION_MODAL);
	};

	private onConfirmModal = () => {
		const { closeModal, account, channel, config } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		if (isSignedIn(account)) {
			return redirectToSubscriptions(channel, config);
		}
		return this.onSignIn();
	};

	private openScheduleDetailModal() {
		const { schedule, channel } = this.props;

		getUpdatedItem(channel.id).then(ch => {
			const props: ScheduleDetailOverlayOwnProps = {
				id: SCHEDULE_DETAIL_OVERLAY_MODAL_ID,
				scheduleItem: schedule,
				channel: ch,
				scheduleItemState: isOnNow(schedule.startDate, schedule.endDate) ? EPG2ItemState.ON_NOW : EPG2ItemState.FUTURE
			};

			this.props.showModal({
				id: SCHEDULE_DETAIL_OVERLAY_MODAL_ID,
				type: ModalTypes.CUSTOM,
				element: <ScheduleDetailOverlay {...props} />
			});
		});
	}

	render() {
		const { loading, schedule, channel } = this.props;
		const title = get(schedule, 'item.title') || '';
		const secondaryLanguageTitle = get(schedule, 'item.secondaryLanguageTitle') || '';
		const className = cx(bem.b({ loading, empty: !schedule.item }), this.props.className);
		const itemImages = schedule.item && resolveItemImage(schedule.item);
		const hasItemImage = itemImages && Object.keys(itemImages).length;
		const channelLogo = resolveChannelLogo(channel);
		const hasChannelLogo = channelLogo && channelLogo !== fallbackURI;
		const hasPremiumIcon = channel && channel.badge;
		const hasPartnerLogo = typeof get(schedule, 'item.images.logo') !== 'undefined';

		let picStyles;
		if (!hasItemImage) {
			picStyles = {
				backgroundImage: `url("${channelLogo}")`
			};
		}

		return (
			<div className={className}>
				<div className={bem.e('header')} title={title} onClick={this.onClick}>
					<div style={picStyles} className={bem.e('pic', { 'no-programme': !hasItemImage })}>
						{!hasItemImage && !hasChannelLogo && this.renderChannelName()}
						{this.renderPicture()}
						{hasPremiumIcon && this.renderBadge()}
						{this.renderProgress()}
						{hasPartnerLogo && (
							<PartnerLogo
								className={bem.e('partner-logo')}
								item={schedule.item}
								imageWidth={{ mobile: 50, tablet: 62, desktopWide: 77 }}
							/>
						)}
					</div>
					{title && (
						<div
							className={cx(
								bem.e('title', { 'text-clip': !secondaryLanguageTitle }),
								secondaryLanguageTitle ? 'truncate' : ''
							)}
						>
							{title}
						</div>
					)}
					{secondaryLanguageTitle && <div className={cx(bem.e('title'), 'truncate')}>{secondaryLanguageTitle}</div>}
					{!schedule.item && (
						<IntlFormatter tagName="div" className={cx(bem.e('title', { 'no-programme': !schedule.item }))}>
							{'@{xepg5_no_programme_on_channel|This is currently no programme showing on this channel}'}
						</IntlFormatter>
					)}
					{this.renderTime()}
				</div>
			</div>
		);
	}

	private renderBadge() {
		const { channel } = this.props;
		return channel.badge && <Badge item={channel} className={bem.e('badge')} mod="packshot" />;
	}

	private renderPicture() {
		const {
			schedule: { item },
			loading
		} = this.props;

		if (loading) {
			return <Spinner className={bem.e('spinner')} />;
		} else if (item) {
			const itemImage = resolveItemImage(item);
			if (itemImage && itemImage[0]) {
				return (
					<Picture
						src={itemImage[0].src}
						sources={itemImage}
						className={bem.e('item-pic')}
						imageClassName={bem.e('item-img')}
					/>
				);
			}
		}
	}

	private renderProgress() {
		const { schedule, customFields } = this.props;
		if (schedule && isOnNow(schedule.startDate, schedule.endDate)) {
			return (
				<LiveProgress
					key={schedule.id}
					from={schedule.startDate}
					to={schedule.endDate}
					barColour={customFields && customFields.channelHexColour}
				/>
			);
		}
	}

	private renderTime() {
		const { schedule, useAmPmTimeFormat } = this.props;
		if (schedule) {
			return (
				<div className={bem.e('time')} key={schedule.startDate.toString()}>
					{isOnNow(schedule.startDate, schedule.endDate) ? (
						<IntlFormatter>{'@{epg_onNow_label|ON NOW}'}</IntlFormatter>
					) : (
						<span>
							<FormattedTime hour12={useAmPmTimeFormat} value={schedule.startDate} />
							{' - '}
							<FormattedTime hour12={useAmPmTimeFormat} value={schedule.endDate} />
						</span>
					)}
				</div>
			);
		}
	}

	renderChannelName() {
		const { channel } = this.props;
		return (
			<div className={bem.e('channel-name-container')}>
				<span className={bem.e('channel-name')}>{channel.title}</span>
			</div>
		);
	}
}

function mapStateToProps({ page, app, account }: state.Root): StateProps {
	const useAmPmTimeFormat = get(app, 'config.linear.useAmPmTimeFormat');
	return {
		currentPath: page.history.location.pathname,
		useAmPmTimeFormat,
		config: app.config,
		account
	};
}

function mapDispatchToProps(dispatch: Dispatch<any>): DispatchProps {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		hideContent: () => dispatch(ToggleContent(false))
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(wrapLinear(Chd2ItemImage));
