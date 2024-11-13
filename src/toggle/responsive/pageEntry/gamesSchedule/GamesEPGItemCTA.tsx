import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import { getCurrentProgram, getOutstandingSchedules } from 'ref/responsive/pageEntry/linear/common/utils';
import { GamesEPGItem } from 'shared/linear/gamesSchedule';
import { DEFAULT_TIME_LIMIT } from 'shared/linear/schedulePuller';
import { isAppWebView } from 'shared/page/pageUtil';
import { getSchedules } from 'shared/service/action/content';
import { getEPGHour } from 'shared/util/dates';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { isOnNow } from 'toggle/responsive/util/channelUtil';
import { isStartOverEnabled } from 'toggle/responsive/util/playerUtil';

import AddToCalendarButton from 'toggle/responsive/component/AddToCalendarButton/AddToCalendarButton';
import CtaButton from 'toggle/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import StartOverIcon from 'toggle/responsive/pageEntry/epg/StartOverIcon';

import './GamesEPGItemCTA.scss';

const bem = new Bem('games-epg-item');
const ctaBem = bem.e('cta');
const ctaBtnBem = new Bem(bem.e('cta-btn'));

interface OwnProps {
	className?: string;
	scheduleItem: GamesEPGItem;
	icsContent?: any;
	onPlayClick: (e, startover?: boolean) => void;
}

interface DispatchProps {
	getChannelSchedule: (channelId: string, date: Date, hour: number, intersect: boolean) => Promise<any>;
}
interface StateProps {
	location?: HistoryLocation;
	startOverButtonSecondsAvailability: number;
}

type Props = DispatchProps & StateProps & OwnProps;
interface State {
	showStartover: boolean;
}

class GamesEPGItemCTA extends React.Component<Props, State> {
	constructor(props) {
		super(props);
		this.state = {
			showStartover: false
		};
	}

	async componentDidMount() {
		const { axisId, startDate, endDate } = this.props.scheduleItem;
		const onNow = isOnNow(startDate, endDate);
		if (onNow) {
			await this.checkStartoverAvailability(axisId);
		}
	}

	async checkStartoverAvailability(channelId: string) {
		const { getChannelSchedule, startOverButtonSecondsAvailability } = this.props;

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const { payload } = await getChannelSchedule(channelId, today, getEPGHour(), true);

		if (payload) {
			const outstandingSchedules = getOutstandingSchedules(payload[0].schedules);
			const currentProgram = getCurrentProgram(outstandingSchedules);

			// Display startover button 60s after epg start time
			// Time offset from AXIS config
			const startoverStartTime =
				new Date(currentProgram.startDate).getTime() + startOverButtonSecondsAvailability * 1000;

			const isStartoverButtonAvailable = new Date().getTime() >= startoverStartTime;

			if (isStartOverEnabled(currentProgram) && isStartoverButtonAvailable) {
				this.setState({ showStartover: true });
			}
		}
	}

	render() {
		const { className, onPlayClick, scheduleItem } = this.props;
		const { axisId, mediaId, startDate, endDate } = scheduleItem;

		const onNow = isOnNow(startDate, endDate);
		const isFutureEvent = new Date(startDate) > new Date();
		const isVOD = mediaId && mediaId.length > 0;
		const hasAxisId = axisId && axisId.length > 0;
		return (
			<div className={cx(ctaBem, className)}>
				{isVOD && hasAxisId && (
					<CtaButton className={ctaBtnBem.b('vod')} onClick={e => onPlayClick(e)}>
						<IntlFormatter>{'@{epg_schedule_detail_overlay_on_demand}'}</IntlFormatter>
					</CtaButton>
				)}
				{onNow && this.renderOnNow()}
				{isFutureEvent && this.renderAddToCal()}
			</div>
		);
	}

	renderOnNow() {
		const { location, onPlayClick } = this.props;
		const { showStartover } = this.state;

		const appWebview = isAppWebView(location);
		return showStartover ? (
			<div className={cx(bem.e('cta-group'), { 'app-webview': appWebview })}>
				{this.renderWatchNow()}

				<CtaButton
					className={ctaBtnBem.b('startover')}
					ordinal={appWebview ? 'naked' : 'secondary'}
					theme="dark"
					onClick={e => onPlayClick(e, true)}
				>
					<StartOverIcon className={bem.e('cta-icon')} />
					<IntlFormatter className={bem.e('cta-text')}>{'@{startOver_cta}'}</IntlFormatter>
				</CtaButton>
			</div>
		) : (
			this.renderWatchNow()
		);
	}

	renderWatchNow() {
		const { onPlayClick } = this.props;

		return (
			<CtaButton className={ctaBtnBem.b('watch-now')} ordinal="primary" theme="light" onClick={e => onPlayClick(e)}>
				<IntlFormatter>{'@{watch_now_btn}'}</IntlFormatter>
			</CtaButton>
		);
	}

	renderAddToCal() {
		const { scheduleItem, icsContent } = this.props;
		const { eventName, programDescEnglish, startDate, endDate, path } = scheduleItem;

		const icsTitlePrefix = (icsContent && icsContent.icsTitle) || 'mewatch  – ';
		const calendarEvent = {
			title: `${icsTitlePrefix} ${programDescEnglish} ${eventName}`,
			description: (icsContent && icsContent.icsDescription) || 'Sign in to mewatch to catch your favourite content.',
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			channelLink: path
				? `${window.location.protocol}//${window.location.host}${path}?cid=mewatch_calendar`
				: `${window.location.protocol}//${window.location.host}?cid=mewatch_calendar`
		};

		return <AddToCalendarButton className={ctaBtnBem.b('add-to-cal')} calendarEvent={calendarEvent} />;
	}
}

function mapStateToProps(state: state.Root): any {
	return {
		location: state.page.history.location,
		startOverButtonSecondsAvailability:
			get(state.app.config, 'general.customFields.StartOverButtonSecondsAvailability') || 0
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getChannelSchedule: (channelId: string, date: Date, hour: number, intersect: boolean) =>
			dispatch(getSchedules([channelId], date, hour, DEFAULT_TIME_LIMIT, { intersect }))
	};
}

export default connect<Props, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(GamesEPGItemCTA);
