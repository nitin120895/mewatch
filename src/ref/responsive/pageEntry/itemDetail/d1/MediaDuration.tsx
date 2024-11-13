import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface MediaDurationProps {
	duration: number;
	resumePoint?: number;
	className?: string;
}

export default function MediaDuration({ duration, resumePoint, className }: MediaDurationProps) {
	const timeLeft = resumePoint ? duration - resumePoint : duration;
	if (timeLeft < 1) return;
	const minutes = Math.round(timeLeft / 60);
	const parts = [];
	if (minutes)
		parts.push('@{itemDetail_meta_duration_minute|"{minutes, number} {minutes, plural, one {min} other {mins}}');
	if (resumePoint) parts.push('@{itemDetail_media_duration_remaining|left}');
	return (
		<IntlFormatter className={className} values={{ minutes }}>
			{parts.join(' ')}
		</IntlFormatter>
	);
}
