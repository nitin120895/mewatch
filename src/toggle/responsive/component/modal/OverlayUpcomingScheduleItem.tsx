import * as React from 'react';
import * as cx from 'classnames';
import { FormattedTime } from 'react-intl';
import { Bem } from 'shared/util/styles';
import LiveProgress from 'toggle/responsive/component/LiveProgress';
import { get } from 'shared/util/objects';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { isOnNow } from '../../util/channelUtil';
import EpisodeInfo from 'toggle/responsive/component/EpisodeInfo';

import './OverlayUpcomingScheduleItem.scss';

const bem = new Bem('overlay-upcoming-schedule-item');

interface OwnProps {
	schedule: api.ItemSchedule;
	isMobileLandscape: boolean;
	useAmPmTimeFormat: boolean;
}

export default function OverlayUpcomingScheduleItem(props: OwnProps) {
	const { schedule, isMobileLandscape, useAmPmTimeFormat } = props;
	const { startDate, endDate, id } = schedule;
	const title = get(schedule, 'item.title');
	const secondaryTitle = get(schedule, 'item.secondaryLanguageTitle');
	const seasonNumber = get(schedule, 'item.seasonNumber');
	const episodeNumber = get(schedule, 'item.episodeNumber');
	const classification = get(schedule, 'item.classification.name');
	const onNow = isOnNow(startDate, endDate);

	const classes = bem.b({
		selected: onNow,
		landscape: isMobileLandscape
	});

	return (
		<div className={classes}>
			<div className={bem.e('time')} key={startDate.toString()}>
				{onNow ? (
					<IntlFormatter className="on-now">{'@{epg_onNow_label|ON NOW}'}</IntlFormatter>
				) : (
					<FormattedTime hour12={useAmPmTimeFormat} value={startDate} />
				)}
			</div>
			{title && <div className={cx(bem.e('title'), 'truncate')}>{title}</div>}
			{secondaryTitle && <div className={cx(bem.e('title'), 'truncate')}>{secondaryTitle}</div>}
			<div className={bem.e('season-info')}>
				<EpisodeInfo seasonNumber={seasonNumber} episodeNumber={episodeNumber} />
				{classification && <span className="divider">&nbsp;</span>}
				{classification && <IntlFormatter className={bem.e('classification')}>{classification}</IntlFormatter>}
			</div>
			{onNow && <LiveProgress key={id} from={startDate} to={endDate} />}
		</div>
	);
}
