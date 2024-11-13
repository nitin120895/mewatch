import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface MediaDurationProps {
	duration: number;
	resumePoint?: number;
	className?: string;
}

export default function MediaDuration({ duration, resumePoint, className }: MediaDurationProps) {
	const secsLeft = resumePoint ? duration - resumePoint : duration;
	if (secsLeft < 1) return <div />;
	const minutes = Math.round(secsLeft / 60);
	const time = minutes > 0 ? minutes : secsLeft;
	const parts = [];

	if (minutes > 0) {
		parts.push('@{itemDetail_meta_duration_minute|"{time, number} {time, plural, one {min} other {mins}}');
	} else {
		parts.push('@{itemDetail_meta_duration_second|"{time, number} {time, plural, one {sec} other {secs}}');
	}

	if (resumePoint) parts.push('@{itemDetail_media_duration_remaining|left}');

	return (
		<IntlFormatter className={className} values={{ time }}>
			{parts.join(' ')}
		</IntlFormatter>
	);
}
