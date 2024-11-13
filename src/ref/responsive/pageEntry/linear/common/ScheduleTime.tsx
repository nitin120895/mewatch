import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { formatScheduleTime, isBetween } from 'shared/util/dates';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './ScheduleTime.scss';

export interface ScheduleTimeProps {
	from: Date;
	to: Date;
	hasOnNowLabel?: boolean;
}

const bem = new Bem('schedule-time');

export default function ScheduleTime({ from, to, hasOnNowLabel = false }: ScheduleTimeProps) {
	const isOnNowShown = hasOnNowLabel && isBetween(new Date(), from, to);

	return (
		<div className={cx(bem.b({ 'on-now': isOnNowShown }))}>
			{isOnNowShown ? (
				<IntlFormatter elementType="span">{`@{channel_asset_on_now|ON NOW}`}</IntlFormatter>
			) : (
				`${formatScheduleTime(from)} – ${formatScheduleTime(to)}`
			)}
		</div>
	);
}
