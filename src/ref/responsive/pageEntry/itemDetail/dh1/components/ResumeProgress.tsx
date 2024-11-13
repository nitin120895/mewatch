import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './ResumeProgress.scss';

interface ResumeProgressProps {
	className?: string;
	title?: string;
	resumePoint: number;
	duration: number;
}

const bem = new Bem('resume-progress');

export default ({ className, title, resumePoint, duration }: ResumeProgressProps) => {
	const classes = cx(bem.b({ 'has-title': !!title, 'no-title': !title }), className);
	const minute = Math.round((duration - resumePoint) / 60);
	const percent = Math.ceil(100 * (resumePoint / duration));
	const valueStyle = { width: `${percent}%` };
	return (
		<div className={classes}>
			<div className={bem.e('info')}>
				{title && <span className={bem.e('title')}>{title}</span>}
				<IntlFormatter className="sr-only" values={{ minute }}>
					{'@{itemDetail_resume_time_aria|{minute, number} {minute, plural, one {minute} other {minutes}} left}'}
				</IntlFormatter>
				<IntlFormatter className={bem.e('time')} values={{ minute }} aria-hidden={true}>
					{'@{itemDetail_resume_time|{minute, number} {minute, plural, one {min} other {mins}} left}'}
				</IntlFormatter>
			</div>
			<div className={bem.e('bar')}>
				<div className={bem.e('value')} style={valueStyle} />
			</div>
		</div>
	);
};
