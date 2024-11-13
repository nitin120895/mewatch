import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import 'ref/responsive/pageEntry/itemDetail/dh1/components/ResumeProgress.scss';

interface ResumeProgressProps {
	className?: string;
	title?: string;
	resumePoint: number;
	duration: number;
}

const bem = new Bem('resume-progress');

export default ({ className, title, resumePoint, duration }: ResumeProgressProps) => {
	const classes = cx(bem.b({ 'has-title': !!title, 'no-title': !title }), className);
	const second = Math.round(duration - resumePoint);
	const minute = Math.round((duration - resumePoint) / 60);
	const displayInMin = minute > 0;
	const percent = Math.ceil(100 * (resumePoint / duration));
	const valueStyle = { width: `${percent}%` };
	return (
		<div className={classes}>
			<div className={bem.e('info')}>
				{title && <span className={bem.e('title')}>{title}</span>}
				{displayInMin ? (
					<span>
						<IntlFormatter className="sr-only" values={{ minute }}>
							{
								'@{itemDetail_resume_time_min_aria|{minute, number} {minute, plural, one {minute} other {minutes}} left}'
							}
						</IntlFormatter>
						<IntlFormatter className={bem.e('time')} values={{ minute }} aria-hidden={true}>
							{'@{itemDetail_resume_time_min|{minute, number} {minute, plural, one {min} other {mins}} left}'}
						</IntlFormatter>
					</span>
				) : (
					<span>
						<IntlFormatter className="sr-only" values={{ second }}>
							{
								'@{itemDetail_resume_time_sec_aria|{second, number} {second, plural, one {second} other {seconds}} left}'
							}
						</IntlFormatter>
						<IntlFormatter className={bem.e('time')} values={{ second }} aria-hidden={true}>
							{'@{itemDetail_resume_time_sec|{second, number} {second, plural, one {sec} other {secs}} left}'}
						</IntlFormatter>
					</span>
				)}
			</div>
			<div className={bem.e('bar')}>
				<div className={bem.e('value')} style={valueStyle} />
			</div>
		</div>
	);
};
