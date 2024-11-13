import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { get } from 'shared/util/objects';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { isMobileLandscape } from 'toggle/responsive/util/grid';
import { enableHeaderPositionTracking } from 'shared/app/appWorkflow';
import { getEPGHour, compareDate } from 'shared/util/dates';
import { EPG2 as template } from 'shared/page/pageEntryTemplate';
import * as profile from 'shared/service/profile';
import { SUBSCRIPTION_REQUIRED_MODAL_ID } from '../../util/subscriptionUtil';
import { getSchedules } from 'shared/service/action/content';
import { isAnonymousUser } from 'shared/account/sessionWorkflow';
import { HideAllModals, ShowPassiveNotification, OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { addReminder, deleteReminder } from 'shared/service/action/profile';
import { getRequiredModalForAnonymous } from 'toggle/responsive/player/playerModals';
import ChannelCarousel from 'toggle/responsive/pageEntry/epg/ChannelCarousel';
import ScheduleDetailOverlay, { ScheduleDetailOverlayOwnProps } from './ScheduleDetailOverlay';
import EPG2Item from 'toggle/responsive/pageEntry/epg/EPG2Item';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Spinner from 'ref/responsive/component/Spinner';
import DatePicker from './datepicker/DatePicker';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { loadNextListPage } from 'shared/list/listWorkflow';
import { GUIDING_TIP_MODAL_ID } from 'shared/uiLayer/uiLayerWorkflow';
import {
	EPG2ItemState,
	isOnNowState,
	getSavedChannel,
	getSavedEPGDate,
	removeSavedChannel,
	removeSavedEPGDate
} from '../../util/epg';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { epgSchedulePath, epgScheduleItemPath } from 'shared/analytics/util/analyticsPath';
import { getItemWithCacheCreator } from 'shared/util/itemUtils';
import { DEFAULT_TIME_LIMIT } from 'shared/linear/schedulePuller';
import { getEPGItemState } from '../utils/epg';

import './EPG2.scss';

const bemEPG2 = new Bem('epg2');
export const SCHEDULE_DETAIL_OVERLAY_MODAL_ID = 'schedule-detail-overlay';
const itemCache = getItemWithCacheCreator();

interface OwnProps extends PageEntryListProps {}
interface DispatchProps {
	enableHeaderPositionTracking: () => void;
	getChannelSchedule: (channelId: string, date: Date, hour: number, intersect: boolean) => Promise<any>;
	showModal: (modal: ModalConfig) => void;
	loadNextListPage?: (list: api.ItemList) => {};
	closeModal: (id: string) => void;
	hideAllModals?: () => void;
	addReminder: (body: api.ReminderRequest, options?: profile.AddReminderOptions, info?: any) => Promise<any>;
	deleteReminder: (reminderId: string) => Promise<any>;
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
	getRequiredModal: (onSignIn: () => void, onCancel: () => void) => void;
	pageAnalyticsEvent: (path: string) => any;
}

interface StateProps {
	header: state.Header;
	useAmPmTimeFormat: boolean;
	clientSide: boolean;
	config: api.AppConfig;
	account: api.Account;
	reminderOffset: number | undefined;
	isAnonymous?: boolean;
	guidingTipModal: boolean;
}

type Props = OwnProps & DispatchProps & StateProps;

interface State {
	scheduleList: api.ItemScheduleList;
	channel: api.ItemSummary;
	date: Date;
	loading: boolean;
	shouldScrollTo: number;
}

class EPG2 extends React.Component<Props, State> {
	refreshInterval: number;
	controlsRef: HTMLDivElement;
	scheduleListRef: HTMLElement;
	onNowItemRef: EPG2Item;

	state: State = {
		scheduleList: undefined,
		channel: this.getInitialChannel(),
		date: this.getInitialDate(),
		loading: true,
		shouldScrollTo: 0
	};

	componentDidMount() {
		this.props.enableHeaderPositionTracking();
		this.getChannelSchedule();
		this.refreshInterval = window.setInterval(() => this.forceUpdate(), 1000 * 60);
	}

	componentWillUnmount() {
		clearInterval(this.refreshInterval);
	}

	componentDidUpdate(prevProps: Props, prevState: State) {
		const { guidingTipModal } = this.props;
		const { channel, date, shouldScrollTo } = this.state;

		if (prevProps.guidingTipModal && guidingTipModal !== prevProps.guidingTipModal) {
			this.scrollToActiveScheduleItem();
		}

		if (channel.id !== prevState.channel.id || date !== prevState.date) {
			this.sendAnalyticsEvent(epgSchedulePath(date, channel.title));
			this.setState({ shouldScrollTo: 0 });
		}

		if (shouldScrollTo > 0) {
			window.scrollTo({ top: shouldScrollTo });
		}
	}

	sendAnalyticsEvent = (path: string) => {
		const { pageAnalyticsEvent } = this.props;
		pageAnalyticsEvent(path);
	};

	getInitialChannel() {
		const savedChannel = getSavedChannel();
		if (savedChannel) {
			removeSavedChannel();
			return savedChannel;
		}
		return this.getFirstChannel();
	}

	getInitialDate() {
		const savedDate = getSavedEPGDate();

		if (savedDate) {
			removeSavedEPGDate();
			return new Date(savedDate);
		}
		return new Date();
	}

	render() {
		const { clientSide } = this.props;
		if (!clientSide) return <div />;
		const paddingTop = this.controlsRef ? this.controlsRef.offsetHeight : 0;

		return (
			<div className={cx(bemEPG2.b(), 'full-bleed')} style={{ paddingTop }}>
				{this.renderEPGControls()}
				<div ref={this.setScheduleListRef} className={bemEPG2.e('schedule-list')}>
					{this.renderScheduleItems()}
				</div>
			</div>
		);
	}

	closeModal = () => {
		const { closeModal } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);
	};

	renderEPGControls() {
		const { list, loadNextListPage } = this.props;
		const { channel, date } = this.state;

		return (
			<div ref={element => (this.controlsRef = element)} className={bemEPG2.e('epg-controls')}>
				<DatePicker date={date} onDateChange={this.onDateChange} />
				<ChannelCarousel
					loadNextListPage={loadNextListPage}
					list={list}
					activeChannel={channel}
					onChange={this.onChannelChange}
				/>
			</div>
		);
	}

	renderScheduleItems() {
		const { scheduleList, loading } = this.state;
		if (loading) return <Spinner className={bemEPG2.e('spinner')} />;

		if (!scheduleList || (scheduleList.schedules && scheduleList.schedules.length === 0))
			return (
				<div className={bemEPG2.e('no-schedule')}>
					<IntlFormatter tagName="div">
						{'@{epg_noMetadata_description_part1|We are currently experiencing network issue}'}
					</IntlFormatter>
					<IntlFormatter tagName="div" className="marginTop">
						{' '}
						{'@{epg_noMetadata_description_part2|Please try again later}'}{' '}
					</IntlFormatter>
				</div>
			);

		const now = new Date();
		return scheduleList.schedules.map(scheduleItem => this.renderScheduleItem(scheduleItem, now));
	}

	renderScheduleItem(scheduleItem: api.ItemSchedule, now: Date) {
		const { config, account, showModal, closeModal, useAmPmTimeFormat } = this.props;
		const { startDate, endDate } = scheduleItem;
		const epgItemState = getEPGItemState(startDate, endDate, now);

		return (
			<EPG2Item
				ref={ref => this.setOnNowItemRef(ref, epgItemState)}
				key={scheduleItem.id}
				channel={this.state.channel}
				date={this.state.date}
				scheduleItem={scheduleItem}
				epgItemState={epgItemState}
				onClick={this.onScheduleItemClick}
				useAmPmTimeFormat={useAmPmTimeFormat}
				config={config}
				account={account}
				openModal={showModal}
				closeModal={closeModal}
			/>
		);
	}

	private scrollToPosition = (position: number) => {
		this.setState({ shouldScrollTo: position });
	};

	private onScheduleItemClick = (scheduleItem: api.ItemSchedule, scheduleItemState: EPG2ItemState) => {
		const { pageAnalyticsEvent } = this.props;
		const { channel } = this.state;
		const { startDate } = scheduleItem;
		const channelTitle = channel.title;
		const itemDate = new Date(startDate);
		const itemTitle = get(scheduleItem, 'item.title');
		pageAnalyticsEvent(epgScheduleItemPath(itemDate, itemTitle, channelTitle));

		const props: ScheduleDetailOverlayOwnProps = {
			id: SCHEDULE_DETAIL_OVERLAY_MODAL_ID,
			scheduleItem,
			scheduleItemState,
			channel: this.state.channel,
			date: this.state.date,
			onScheduleItemClick: this.onScheduleItemClick,
			scrollToPosition: this.scrollToPosition
		};

		this.props.showModal({
			id: SCHEDULE_DETAIL_OVERLAY_MODAL_ID,
			type: ModalTypes.CUSTOM,
			element: <ScheduleDetailOverlay {...props} />
		});
	};

	getFirstChannel() {
		const { list } = this.props;
		if (list && list.items.length > 0) return list.items[0];

		return undefined;
	}

	setScheduleListRef = (ref: HTMLDivElement) => {
		if (!this.scheduleListRef) {
			this.scheduleListRef = findDOMNode<HTMLElement>(ref);
			this.scrollToActiveScheduleItem();
		}
	};

	setOnNowItemRef = (ref: EPG2Item, epgItemState: EPG2ItemState) => {
		if (!ref || !isOnNowState(epgItemState)) return;

		const startDate = ref.props.scheduleItem.startDate;
		const oldStartDate = this.onNowItemRef && this.onNowItemRef.props.scheduleItem.startDate;

		if (!this.onNowItemRef || startDate !== oldStartDate) {
			this.onNowItemRef = ref;
		}
		this.scrollToActiveScheduleItem();
	};

	scrollToActiveScheduleItem = () => {
		if (!this.onNowItemRef || !this.scheduleListRef) return;
		const { offsetHeight, offsetTop } = findDOMNode<HTMLElement>(this.onNowItemRef);

		const halfItemHeight = isMobileLandscape() ? 0 : offsetHeight / 2;

		// focus "ON NOW" item and half of the PAST item or just "ON NOW" for mobile landscape
		const offset = this.scheduleListRef.offsetTop + halfItemHeight;

		window.scrollTo(0, offsetTop - offset);
	};

	private onDateChange = (date: Date) => {
		this.setState({ date }, () => this.getChannelSchedule());
	};

	onChannelChange = (channel: api.ItemSummary) => {
		this.setState({ loading: true, channel }, () => this.getChannelData(channel));
	};

	getChannelData = (channel: api.ItemSummary) => {
		const { getChannelSchedule } = this.props;
		const { date } = this.state;
		this.onNowItemRef = undefined;
		this.setState({ loading: true });
		// Setting the Date at midnight in current timezone, the service will convert to UTC
		date.setHours(0, 0, 0, 0);

		// Retrieving the channel data individually (itemCache(channel.id)) is required here as offers are not sent with
		// the page entries list, resulting in the offers not being correct.
		// Previously this was being done on the EPG2Item component but this resulted in multple calls to the same
		// API endpoint.
		//
		// Doing this here instead ensures that the channel needs only the be downloaded once.
		//
		// Currently the schedule is still being downloaded multiple times. This is probably not desirable and should
		// be looked into at a future date.

		const channelDataPromises = [itemCache(channel.id), getChannelSchedule(channel.id, date, getEPGHour(), true)];

		Promise.all(channelDataPromises).then(([channel, channelSchedule]) => {
			const scheduleList = channelSchedule.payload.shift();

			const error = !scheduleList || !scheduleList.schedules || scheduleList.schedules.length === 0;
			if (error || compareDate(date, new Date()) !== 0) window.scrollTo(0, 0);

			this.setState({ channel, scheduleList, loading: false });
		});
	};

	getChannelSchedule = () => this.getChannelData(this.state.channel);
}

function mapStateToProps(state: state.Root): StateProps {
	const { app, account, uiLayer } = state;
	const { config } = app;
	const reminderOffset = get(app, 'config.linear.epgReminderNotificationOffsetMinutes');
	const appModals = get(uiLayer, 'modals.app') || [];
	const guidingTipModal = appModals.find(modal => modal.id === GUIDING_TIP_MODAL_ID);
	return {
		clientSide: app.clientSide,
		header: app.header,
		useAmPmTimeFormat: config.linear ? config.linear.useAmPmTimeFormat : true,
		config,
		account: account && account.info,
		reminderOffset,
		isAnonymous: isAnonymousUser(state),
		guidingTipModal
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getChannelSchedule: (channelId: string, date: Date, hour: number, intersect: boolean) =>
			dispatch(getSchedules([channelId], date, hour, DEFAULT_TIME_LIMIT, { intersect })),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		enableHeaderPositionTracking: () => dispatch(enableHeaderPositionTracking()),
		loadNextListPage: list => dispatch(loadNextListPage(list)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		hideAllModals: () => dispatch(HideAllModals()),
		addReminder: (body: api.ReminderRequest, options?: profile.AddReminderOptions, info?: any): Promise<any> =>
			dispatch(addReminder(body, options, info)),
		deleteReminder: (reminderId: string): Promise<any> =>
			dispatch(deleteReminder(reminderId, {}, { itemId: reminderId })),
		showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
			dispatch(ShowPassiveNotification(config)),
		getRequiredModal: (onSignIn: () => void, onCancel: () => void) => {
			dispatch(OpenModal(getRequiredModalForAnonymous(onSignIn, onCancel)));
		},
		pageAnalyticsEvent: path => dispatch(pageAnalyticsEvent(path))
	};
}

const Component: any = connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(EPG2);
Component.template = template;

export default Component;
