import * as React from 'react';
import { FormattedTime } from 'react-intl';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import { getItem } from 'shared/service/content';
import { isMobile } from 'shared/util/browser';
import { CloseModal, HideAllModals } from 'shared/uiLayer/uiLayerWorkflow';
import { browserHistory } from 'shared/util/browserHistory';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { redirectToSubscriptions } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import { getEPGItemState } from 'toggle/responsive/pageEntry/utils/epg';
import { canPlay, isSubscriptionRequired } from 'toggle/responsive/pageEntry/util/offer';
import { toggleBodyClass } from 'toggle/responsive/util/cssUtil';
import { isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import { EPG2ItemState, isFutureState } from 'toggle/responsive/util/epg';
import { isPortrait } from 'toggle/responsive/util/grid';
import { getCessationScheduleMessage, getProviderGroupName } from 'toggle/responsive/util/subscriptionUtil';

import AddToCalendarButton from 'toggle/responsive/component/AddToCalendarButton/AddToCalendarButton';
import CloseIcon from 'toggle/responsive/component/modal/CloseIcon';
import CtaButton from 'toggle/responsive/component/CtaButton';
import EpisodeListIcon from 'toggle/responsive/player/controls/icons/EpisodeListIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PartnerLogo from 'toggle/responsive/component/PartnerLogo';
import ReminderComponent from 'toggle/responsive/pageEntry/epg/ReminderComponent';

import './ScheduleDetailOverlay.scss';

const bem = new Bem('schedule-detail-overlay');
const bemOverlay = new Bem('overlay');

export interface ScheduleDetailOverlayOwnProps {
	scheduleItem: api.ItemSchedule;
	scheduleItemState: EPG2ItemState;
	id: string;
	channel?: api.ItemSummary;
	onScheduleItemClick?: (scheduleItem: api.ItemSchedule, scheduleItemState: EPG2ItemState) => void;
	date?: Date;
	scrollToPosition?: (position: number) => void;
}

interface ScheduleDetailOverlayStateProps {
	config?: state.Config;
	account: api.Account;
}

interface ScheduleDetailOverlayDispatchProps extends ModalManagerDispatchProps {
	hideAllModals?: () => void;
}

type ScheduleDetailOverlayProps = ScheduleDetailOverlayOwnProps &
	ScheduleDetailOverlayStateProps &
	ScheduleDetailOverlayDispatchProps;

class ScheduleDetailOverlay extends React.Component<ScheduleDetailOverlayProps> {
	private scrollPosition: number;
	private overlayContainer: HTMLElement;

	componentWillMount() {
		const { scrollToPosition } = this.props;
		this.scrollPosition = window.scrollY;
		scrollToPosition && scrollToPosition(this.scrollPosition);
	}

	componentDidMount() {
		toggleBodyClass('schedule-detail-overlay-opened');
		// Prevents appearance of page scrolling to top, while
		// also disabling scroll of body via CSS
		document.body.style.top = `-${this.scrollPosition}px`;
	}

	componentWillUnmount() {
		const { scrollToPosition } = this.props;
		toggleBodyClass('schedule-detail-overlay-opened');
		window.scrollTo({ top: this.scrollPosition });
		document.body.style.top = '';
		scrollToPosition && scrollToPosition(this.scrollPosition);
	}

	onDemandClick = e => {
		const { closeModal, scheduleItem, id } = this.props;
		closeModal(id);
		browserHistory.push(scheduleItem.item.path);
	};

	openSubscriptionModal = () => {
		const { channel, config, hideAllModals } = this.props;
		getItem(channel.id)
			.then(result => {
				hideAllModals();
				redirectToSubscriptions(result.data, config);
			})
			.catch(error => console.warn(error));
		return;
	};

	onCancel = () => {
		this.onClose();
		this.props.onScheduleItemClick(this.props.scheduleItem, this.props.scheduleItemState);
	};

	setOverlayContainer = ref => {
		this.overlayContainer = ref;
	};

	onOverlayClose = e => {
		if (e.target !== this.overlayContainer) return;
		this.onClose();
	};

	onClose = () => {
		const { closeModal, id } = this.props;
		closeModal(id);
	};

	render() {
		const { scheduleItemState } = this.props;
		const landscape = !isPortrait() && isMobile();
		if (scheduleItemState === EPG2ItemState.ON_NOW) return false;
		return (
			<div className={bem.b({ landscape })} onClick={this.onOverlayClose} ref={this.setOverlayContainer}>
				<div className={bem.e('modal')}>
					<div className={bem.e('close')} onClick={this.onClose}>
						<CloseIcon />
					</div>

					{this.renderContent()}
					{this.renderFooter()}
				</div>
			</div>
		);
	}

	renderContent() {
		const { scheduleItem } = this.props;
		const {
			images,
			description,
			classification,
			secondaryLanguageTitle,
			episodeTitle,
			title,
			seasonNumber,
			episodeNumber
		} = scheduleItem.item;
		const image = images && images.wallpaper;
		const showPartnerLogo = images && images.logo;
		const { endDate, startDate } = scheduleItem;
		return (
			<div className={bem.e('container')}>
				<div className={bem.e('schedule-item')}>
					<div className={bem.e('image')}>
						{image ? (
							<img src={image} className={bem.e('thumbnail')} alt={title} />
						) : (
							<div className={bem.e('placeholder')} />
						)}
						{showPartnerLogo && (
							<PartnerLogo
								className={bem.e('partner-logo')}
								item={scheduleItem.item}
								imageWidth={{ mobile: 88, tablet: 103, desktopWide: 128 }}
							/>
						)}
					</div>

					<div className={bem.e('metadata')}>
						<h2 className={bem.e('title')}>{title}</h2>
						{secondaryLanguageTitle && <h3 className={bem.e('secondary-title')}>{secondaryLanguageTitle}</h3>}
						<div className={bem.e('details')}>
							<div className={bem.e('time')}>
								<FormattedTime value={startDate} />
								{' - '}
								<FormattedTime value={endDate} />
								{classification && <span className={bem.e('dash')}>&nbsp;</span>}
								{classification && <div className={bem.e('classification')}>{classification.name}</div>}
							</div>
							<div>
								{seasonNumber && (
									<IntlFormatter values={{ season: seasonNumber }}>
										{'@{epg_schedule_detail_overlay_season_number|Season {season}}'}
										{episodeNumber ? ', ' : ' '}
									</IntlFormatter>
								)}
								{episodeNumber && (
									<IntlFormatter values={{ episode: episodeNumber }}>
										{'@{epg_schedule_detail_overlay_episode_number|Episode {episode}}'}
										{episodeTitle && <span className={bem.e('dash')}>&nbsp;</span>}
									</IntlFormatter>
								)}
								{episodeTitle && <span>{episodeTitle}</span>}
							</div>
						</div>
					</div>
				</div>

				<div className={bem.e('description')}>{description}</div>
			</div>
		);
	}

	renderFooter() {
		const {
			scheduleItem: { item },
			scheduleItemState,
			channel,
			config
		} = this.props;
		const isVODTVShow = item.path && item.enableCatchUp;
		const isFutureContent = scheduleItemState === EPG2ItemState.FUTURE;
		const entitled = !isSubscriptionRequired(channel);
		const { episodeNumber, enableCatchUp } = item;
		const provider = get(channel, 'customFields.Provider');
		const providerGroupName = getProviderGroupName(config, provider);
		const cessationSubscriptionDisclaimer = getCessationScheduleMessage(config, providerGroupName);

		return (
			<div className="footer-details">
				{isContentProviderCeased(channel) && (
					<IntlFormatter className="cessation-disclaimer">{cessationSubscriptionDisclaimer}</IntlFormatter>
				)}
				<div className={bem.e('buttons')}>
					{isFutureContent && !entitled && !isContentProviderCeased(channel) && (
						<CtaButton className={bem.e('button')} ordinal="secondary" onClick={this.openSubscriptionModal}>
							<IntlFormatter>{'@{itemDetail_labels_subscribe}'}</IntlFormatter>
						</CtaButton>
					)}

					{isVODTVShow && entitled && (
						<div>
							<CtaButton className={bem.e('button')} ordinal="secondary" onClick={this.onDemandClick}>
								<EpisodeListIcon />
								<IntlFormatter>{'@{epg_schedule_detail_overlay_on_demand|On Demand}'}</IntlFormatter>
							</CtaButton>
							{episodeNumber > 1 && enableCatchUp && (
								<div className={bem.e('information-label')}>
									<IntlFormatter>
										{'@{epg_schedule_detail_overlay_more_episodes|More episodes available}'}
									</IntlFormatter>
								</div>
							)}
						</div>
					)}
					{(!isContentProviderCeased(channel) || entitled) && this.renderReminder()}
				</div>
			</div>
		);
	}
	isShowAddToCalBtn() {
		const { account, channel, config, scheduleItem } = this.props;
		const { startDate, endDate } = scheduleItem;
		const epgItemState = getEPGItemState(startDate, endDate, new Date());
		const wcChannels = get(config, 'general.customFields.WC2022ChannelID');
		const isWCChannel = wcChannels.some(e => e === Number(channel.id));

		if (!isWCChannel || !isFutureState(epgItemState)) return false;
		if (!account) return true;
		return canPlay(channel);
	}

	renderReminder() {
		const {
			scheduleItem: { startDate, endDate, item },
			channel
		} = this.props;
		const epgItemState = getEPGItemState(startDate, endDate, new Date());
		const SAMPLE_CALENDAR_EVENT = {
			title: item.title,
			description: 'Sign in to mewatch with your FIFA World Cup Qatar 2022™subcription to watch.',
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			channelLink: channel.path ? `${window.location.protocol}//${window.location.host}${channel.path}` : ''
		};
		const isShowCalanderButton = this.isShowAddToCalBtn();
		return (
			<div className={cx(bem.e('reminder'), bemOverlay.e('reminder'))}>
				{isShowCalanderButton ? (
					<AddToCalendarButton calendarEvent={SAMPLE_CALENDAR_EVENT} />
				) : (
					<ReminderComponent
						channel={this.props.channel}
						date={this.props.date}
						scheduleItem={this.props.scheduleItem}
						isBackgroundWhite={true}
						epgItemState={epgItemState}
						account={this.props.account}
						entryPoint={DomTriggerPoints.EpisodePopUp}
					/>
				)}
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): ScheduleDetailOverlayStateProps {
	const { app, account } = state;
	return {
		config: app.config,
		account: account.info
	};
}

function mapDispatchToProps(dispatch): ScheduleDetailOverlayDispatchProps {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id)),
		hideAllModals: () => dispatch(HideAllModals())
	};
}

export default connect<
	ScheduleDetailOverlayStateProps,
	ScheduleDetailOverlayDispatchProps,
	ScheduleDetailOverlayOwnProps
>(
	mapStateToProps,
	mapDispatchToProps
)(ScheduleDetailOverlay);
