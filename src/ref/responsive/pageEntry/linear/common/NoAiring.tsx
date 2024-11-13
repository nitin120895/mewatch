import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { wrapLinear } from 'shared/analytics/components/ItemWrapper';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import ChannelLogo from './ChannelLogo';

import './NoAiring.scss';

interface NoAiringProps {
	item: api.ItemSummary;
	schedule: api.ItemSchedule;
	channel: api.ItemSummary;
	path: string;
	channelLogo: string;
	channelTitle: string;
	channelColor?: api.ThemeColor;
	className?: string;
}

const bem = new Bem('no-airing');

function NoAiring({ path, channelLogo, channelTitle, channelColor, className }: NoAiringProps) {
	return (
		<div className={cx(bem.b(), className)}>
			<Link to={path}>
				<div className={bem.e('content')}>
					<div className={bem.e('packshot')} />
					<ChannelLogo logo={channelLogo} title={channelTitle} color={channelColor} />
				</div>
				<IntlFormatter elementType="div" className={cx(bem.e('title'), 'truncate')}>
					{`@{channel_not_airing|Channel Not Airing}`}
				</IntlFormatter>
			</Link>
		</div>
	);
}

export default wrapLinear(NoAiring);
