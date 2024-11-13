import * as React from 'react';
import ProgressBar from 'ref/responsive/component/ProgressBar';
import withLiveProgress from './withLiveProgress';
import { Bem } from 'shared/util/styles';

import './LiveProgress.scss';

const bem = new Bem('live-progress');

interface LiveProgressProps {
	from: Date;
	to: Date;
	progress?: number;
	color?: api.ThemeColor;
}

function LiveProgress({ progress, color }: LiveProgressProps) {
	return <ProgressBar progress={progress} className={bem.b()} color={color} />;
}

export default withLiveProgress()<LiveProgressProps>(LiveProgress);
