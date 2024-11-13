import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './ScheduleError.scss';

const bem = new Bem('schedule-error');

export default function ScheduleError() {
	return (
		<div className={bem.b()}>
			<IntlFormatter>
				{'@{epg_noMetadata_description_part1|We are currently experiencing a network issue.}'}
			</IntlFormatter>
			<IntlFormatter>{'@{epg_noMetadata_description_part2|Please try again later.}'}</IntlFormatter>
		</div>
	);
}
