import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './NoSchedule.scss';

const bem = new Bem('no-schedule');

export default function NoSchedule() {
	return (
		<div className={bem.b()}>
			<IntlFormatter elementType="span">{'@{no_schedules_available|No schedule currently available}'}</IntlFormatter>
		</div>
	);
}
