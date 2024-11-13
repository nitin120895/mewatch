import * as React from 'react';
import * as cx from 'classnames';
import { FormattedTime } from 'react-intl';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import ProgressBar from 'ref/responsive/component/ProgressBar';
import { canPlay, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes, DomTriggerPoints } from 'shared/analytics/types/types';
import { browserHistory } from 'shared/util/browserHistory';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { getEPGScheduleProgress } from 'shared/util/time';
import { resolveImage } from 'shared/util/images';
import { isVodAvailable, getIdpPath } from 'shared/util/schedule';
import EpisodeListIcon from '../../player/controls/icons/EpisodeListIcon';
import StartOverIcon from './StartOverIcon';
import { redirectToSignPage, redirectToSubscriptions } from '../subscription/subscriptionsUtils';
import {
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';
import PartnerLogo from 'toggle/responsive/component/PartnerLogo';
import AddToCalendarButton from 'toggle/responsive/component/AddToCalendarButton/AddToCalendarButton';
import { EPG2ItemState, isOnNowState, isFutureState, isPastState, saveChannel, saveEPGDate } from '../../util/epg';
import {
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	subscriptionRequiredModal,
	SubscriptionsModalProps
} from '../../util/subscriptionUtil';
import { isStartOverEnabled, onPlayerSignUp, isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import { getSignInRequiredModalForAnonymous } from 'toggle/responsive/player/playerModals';

import './EPG2Item.scss';
import ReminderComponent from './ReminderComponent';

const bemEPG2Item = new Bem('epg2-item');
const bemEPG2ItemMetadata = new Bem(bemEPG2Item.e('metadata'));

interface Props {
	channel: api.ItemSummary;
	date: Date;
	scheduleItem: api.ItemSchedule;
	epgItemState: EPG2ItemState;
	useAmPmTimeFormat: boolean;
	onClick: (scheduleItem: api.ItemSchedule, scheduleItemState: EPG2ItemState) => void;
	openModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	config: api.AppConfig;
	account: api.Account;
}

interface State {}

export default class EPG2Item extends React.Component<Props, State> {
	private onEPG2ItemClick = e => {
		const { scheduleItem, epgItemState, onClick, date, channel } = this.props;
		if (!scheduleItem.item) return;

		const isOnNow = isOnNowState(epgItemState);
		const isVOD = isVodAvailable(scheduleItem);

		if (!canPlay(channel) && isOnNow) {
			this.openNextUserActionModal(channel);
		} else if (isOnNow && channel.path) {
			saveChannel(channel);
			saveEPGDate(date);
			browserHistory.push(channel.path);
		} else if (!isOnNow && isVOD) {
			saveChannel(channel);
			saveEPGDate(date);
			browserHistory.push(getIdpPath(scheduleItem));
		} else if (!isOnNow) {
			onClick(scheduleItem, epgItemState);
		}
	};

	onOnDemandCTAClick = e => {
		e.stopPropagation();

		const { scheduleItem, date, channel } = this.props;
		saveChannel(channel);
		saveEPGDate(date);
		browserHistory.push(scheduleItem.item.path);
	};

	openNextUserActionModal(channel) {
		const { openModal, account } = this.props;
		if (isRegistrationOnlyRequired(channel)) {
			return openModal(
				getSignInRequiredModalForAnonymous(this.onSignIn, () => onPlayerSignUp(channel && channel.path))
			);
		} else {
			if (!account) {
				return isContentProviderCeased(channel) ? this.showCessationUpsellModal(channel) : this.showUpsellModal();
			}
		}
		const props: SubscriptionsModalProps = {
			onConfirm: this.onConfirmModal,
			target: 'app',
			isSignedInUser: !!account
		};

		isContentProviderCeased(channel)
			? this.showCessationUpsellModal(channel)
			: openModal(subscriptionRequiredModal(props));
	}

	onConfirmModal = () => {
		const { account, closeModal } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		if (account) {
			return this.onSubscribe();
		}
		return this.onSignIn();
	};

	private showUpsellModal = () => {
		const upsellModalProps: UpsellModalProps = {
			onSubscribe: () => this.onSubscribe(),
			onSignIn: () => this.onSignIn()
		};
		this.props.openModal(upsellModal(upsellModalProps));
	};

	private showCessationUpsellModal = channel => {
		const { account, openModal } = this.props;
		const upsellModalProps: UpsellModalProps = !!account
			? { onSubscribe: () => this.onCessationCancelClick() }
			: {
					onSubscribe: () => this.onCessationCancelClick(),
					onSignIn: () => this.onSignIn()
			  };
		const provider = get(channel, 'customFields.Provider');
		openModal(upsellCessationModal(upsellModalProps, provider));
	};

	onSignIn = () => {
		const { channel, config, date } = this.props;
		saveChannel(channel);
		saveEPGDate(date);
		redirectToSignPage(config, channel.path);
	};

	onSubscribe = () => {
		const { config, date, channel } = this.props;
		saveChannel(channel);
		saveEPGDate(date);
		isContentProviderCeased(channel)
			? this.showCessationUpsellModal(channel)
			: redirectToSubscriptions(channel, config);
	};

	onCessationCancelClick = () => {
		const { closeModal } = this.props;
		closeModal(UPSELL_CESSATION_MODAL);
	};

	onChannelLogoClick = e => {
		const { epgItemState, channel } = this.props;
		e.stopPropagation();
		if (isOnNowState(epgItemState)) {
			if (!canPlay(channel)) {
				this.openNextUserActionModal(channel);
			} else {
				browserHistory.push(channel.path);
			}
		} else {
			browserHistory.push(channel.path);
		}
	};

	renderDate() {
		const { scheduleItem, epgItemState, useAmPmTimeFormat } = this.props;
		return (
			<div className={cx(bemEPG2Item.e('bg'), bemEPG2Item.e('time'))}>
				{isOnNowState(epgItemState) ? (
					<IntlFormatter elementType="span">{'@{epg_onNow_label|ON NOW}'}</IntlFormatter>
				) : (
					<FormattedTime hour12={useAmPmTimeFormat} value={scheduleItem.startDate} />
				)}
			</div>
		);
	}

	renderItemMetadata() {
		const { scheduleItem, epgItemState, channel } = this.props;
		const { startDate, endDate, item } = scheduleItem;
		const { title, images, seasonNumber, episodeNumber, classification, secondaryLanguageTitle, description } = item;

		const image = resolveImage(images, 'wallpaper', { width: 215 });

		let logo;
		if (!image.resolved) logo = resolveImage(channel.images, 'logo', { width: 200, format: 'png' });

		const showProgressBar = isOnNowState(epgItemState);
		const showPartnerLogo = image.resolved && typeof item.images.logo !== 'undefined';

		let progress = 100;
		if (showProgressBar) {
			progress = getEPGScheduleProgress(startDate, endDate);
		}

		return (
			<div className={cx(bemEPG2Item.e('bg'), bemEPG2ItemMetadata.b())}>
				<div
					className={bemEPG2ItemMetadata.e('image-placeholder')}
					onClick={!image.resolved && this.onChannelLogoClick}
				>
					{image.resolved ? (
						<img src={image.src} className={bemEPG2ItemMetadata.e('image')} alt="" />
					) : logo.resolved ? (
						<img src={logo.src} className={bemEPG2ItemMetadata.e('image', { logo: logo.resolved })} alt="" />
					) : (
						<div className={bemEPG2ItemMetadata.e('channel-title')}>{channel.title}</div>
					)}
					{showProgressBar && <ProgressBar progress={progress} />}
					{showPartnerLogo && (
						<PartnerLogo
							className={bemEPG2Item.e('partner-logo')}
							item={item}
							imageWidth={{ mobile: 88, tablet: 103, desktopWide: 128 }}
						/>
					)}
				</div>
				<div className={bemEPG2ItemMetadata.e('details')}>
					<div className={bemEPG2ItemMetadata.e('title')}>
						{title && <div className={!secondaryLanguageTitle ? 'text-clip' : ''}>{title}</div>}
						{secondaryLanguageTitle && <div>{secondaryLanguageTitle}</div>}
					</div>
					<div className={bemEPG2ItemMetadata.e('additional-information')}>
						{seasonNumber && (
							<IntlFormatter elementType="span" values={{ season: seasonNumber }}>
								{'@{epg_schedule_detail_overlay_season_number|Season {season}}'}
								{', '}
							</IntlFormatter>
						)}
						{episodeNumber && (
							<IntlFormatter elementType="span" values={{ episode: episodeNumber }}>
								{'@{epg_schedule_detail_overlay_episode_number|Episode {episode}}'}
								{classification && <span className={bemEPG2ItemMetadata.e('delimiter')} />}
							</IntlFormatter>
						)}
						{classification && <span className={bemEPG2ItemMetadata.e('classification')}>{classification.name}</span>}
					</div>
					{description && <div className={bemEPG2ItemMetadata.e('description')}>{description}</div>}
				</div>
				{this.renderButtons()}
			</div>
		);
	}

	renderButtons() {
		const { scheduleItem, epgItemState } = this.props;
		const isVOD = isVodAvailable(scheduleItem);

		return (
			<div className={bemEPG2ItemMetadata.e('button')}>
				{isVOD && (
					<div className={bemEPG2ItemMetadata.e('on-demand')} onClick={this.onOnDemandCTAClick}>
						<EpisodeListIcon />
						<IntlFormatter className={bemEPG2ItemMetadata.e('on-demand-label')} elementType="span">
							{'@{epg_schedule_detail_overlay_on_demand|On Demand}'}
						</IntlFormatter>
					</div>
				)}
				{isOnNowState(epgItemState) && isStartOverEnabled(scheduleItem) && (
					<div className={bemEPG2ItemMetadata.e('start-over')}>
						<StartOverIcon />
						<IntlFormatter className={bemEPG2ItemMetadata.e('start-over-label')} elementType="span">
							{'@{startOver_cta|Start Over}'}
						</IntlFormatter>
					</div>
				)}
				{this.renderReminderComponent()}
			</div>
		);
	}

	render() {
		const { channel, scheduleItem, epgItemState } = this.props;
		const { item } = scheduleItem;

		let stateClassName = 'on-now';

		if (isPastState(epgItemState)) {
			stateClassName = 'past';
		} else if (isFutureState(epgItemState)) {
			stateClassName = 'future';
		}

		const renderEpgItem = () => (
			<div
				key={scheduleItem.id}
				id={scheduleItem.id}
				className={cx(bemEPG2Item.b(stateClassName), { disabled: !item })}
				onClick={this.onEPG2ItemClick}
			>
				<div className={cx(bemEPG2Item.e('container'), { disabled: !item })}>
					{this.renderDate()}
					{this.renderReminderComponent()}
				</div>
				{item && item.title ? this.renderItemMetadata() : this.renderErrorMessage()}
			</div>
		);

		if (isOnNowState(epgItemState)) {
			return (
				<CTAWrapper key={scheduleItem.id} type={CTATypes.Watch} data={{ item: { ...channel, scheduleItem } }}>
					{renderEpgItem()}
				</CTAWrapper>
			);
		}
		return renderEpgItem();
	}

	isShowAddToCalBtn() {
		const { epgItemState, account, channel, config } = this.props;
		const wcChannels = get(config, 'general.customFields.WC2022ChannelID');
		const isWCChannel = wcChannels.some(e => e === Number(channel.id));

		if (!isWCChannel || !isFutureState(epgItemState)) return false;
		if (!account) return true;
		return canPlay(channel);
	}

	renderReminderComponent() {
		const { scheduleItem, epgItemState, channel, account } = this.props;
		const SAMPLE_CALENDAR_EVENT = {
			title: scheduleItem.item.title,
			description: 'Sign in to mewatch with your FIFA World Cup Qatar 2022™subcription to watch.',
			startDate: new Date(scheduleItem.startDate),
			endDate: new Date(scheduleItem.endDate),
			channelLink: channel.path
				? `${window.location.protocol}//${window.location.host}${channel.path}?cid=mewatch_calendar`
				: ''
		};
		const isShowCalanderButton = this.isShowAddToCalBtn();
		return (
			<div>
				{isShowCalanderButton ? (
					<AddToCalendarButton calendarEvent={SAMPLE_CALENDAR_EVENT} isDropdown={true} />
				) : (
					<ReminderComponent
						channel={channel}
						date={this.props.date}
						scheduleItem={scheduleItem}
						epgItemState={epgItemState}
						account={account}
						entryPoint={DomTriggerPoints.EPGRail}
					/>
				)}
			</div>
		);
	}

	renderErrorMessage() {
		const title = '@{epg_noScheduleItem_description|Programme Information Not Available}';
		const { channel } = this.props;
		const image = resolveImage(channel.images, 'logo', { width: 200, format: 'png' });

		return (
			<div className={cx(bemEPG2Item.e('bg'), bemEPG2ItemMetadata.b())}>
				<div
					className={bemEPG2ItemMetadata.e('image-placeholder')}
					onClick={!image.resolved && this.onChannelLogoClick}
				>
					{image.resolved ? (
						<img src={image.src} className={bemEPG2ItemMetadata.e('image', { logo: image.resolved })} alt="" />
					) : (
						<div className={bemEPG2ItemMetadata.e('channel-title')}>{channel.title}</div>
					)}
				</div>
				<div className={bemEPG2ItemMetadata.e('details')}>
					<IntlFormatter className={cx(bemEPG2ItemMetadata.e('title'), 'error')}>{title}</IntlFormatter>
				</div>
			</div>
		);
	}
}
