import * as React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import * as cx from 'classnames';
import * as gamesSchedule from 'shared/linear/gamesSchedule';
import { isOnNow } from 'toggle/responsive/util/channelUtil';
import { bem } from 'toggle/responsive/pageEntry/gamesSchedule/GamesEPGItem';

import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import SGFlag from 'toggle/responsive/pageEntry/gamesSchedule/SGFlag';

import './GamesEPGItemMetadata.scss';

interface Props {
	className?: string;
	scheduleItem: gamesSchedule.GamesEPGItem;
	showDate?: boolean;
}

const GamesEPGItemMetadata = (props: Props) => {
	const { className, scheduleItem, showDate } = props;
	const { liveIndicator, logoFlag, startDate, endDate } = scheduleItem;
	const onNow = isOnNow(startDate, endDate);
	const isFutureEvent = new Date(startDate) > new Date();
	const showLive = liveIndicator && (onNow || isFutureEvent);
	const liveLabel = onNow ? '@{games_schedule_live_now|Live}' : '@{games_schedule_live_future|Live Telecast}';
	const liveLabelClass = onNow ? 'on-now' : '';
	const displayDate = showDate || false;

	return (
		<div className={cx(bem.e('metadata'), className)}>
			<div className={bem.e('time')}>
				{displayDate && (
					<span className={bem.e('date')}>
						<FormattedDate value={startDate} day="2-digit" /> <FormattedDate value={startDate} month="short" />,
					</span>
				)}
				<FormattedTime hour12={true} value={startDate} /> - <FormattedTime hour12={true} value={endDate} />
			</div>
			{showLive && <IntlFormatter className={cx(bem.e('live'), liveLabelClass)}>{liveLabel}</IntlFormatter>}
			{logoFlag && <SGFlag className={bem.e('flag')} />}
		</div>
	);
};

export default GamesEPGItemMetadata;
