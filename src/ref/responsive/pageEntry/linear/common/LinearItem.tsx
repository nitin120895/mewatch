import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { isEpisode } from 'ref/responsive/util/item';
import { isOnNow } from './utils';
import { noop } from 'shared/util/function';
import Link from 'shared/component/Link';
import { default as Packshot, PackshotProps } from 'ref/responsive/component/Packshot';
import { wrapLinear } from 'shared/analytics/components/ItemWrapper';
import PackshotOverlay from 'ref/responsive/component/PackshotOverlay';
import LiveProgress from './LiveProgress';
import ChannelLogo from './ChannelLogo';
import ScheduleTime from './ScheduleTime';
import ScheduleTitle from './ScheduleTitle';

import './LinearItem.scss';

const bem = new Bem('linear-item');

export interface LinearItemProps {
	path: string;
	item: api.ItemSummary;
	schedule: api.ItemSchedule;
	channel: api.ItemSummary;
	channelLogo: string;
	channelShortCode: string;
	channelColor: api.ThemeColor;
	imageType: PackshotProps['imageType'];
	imageOptions: PackshotProps['imageOptions'];
	hasLogo?: boolean;
	hasProgressBar?: boolean;
	hasPlayIconAlwaysShown?: boolean;
	hasOnNowLabel?: boolean;
	onClick?: (e: React.SyntheticEvent<any>) => void;
	className?: PackshotProps['className'];
}

function LinearItem({
	path,
	item,
	schedule,
	channelLogo,
	channelShortCode,
	channelColor,
	imageType,
	imageOptions,
	hasLogo = false,
	hasProgressBar = false,
	hasPlayIconAlwaysShown = false,
	hasOnNowLabel = false,
	onClick = noop,
	className
}: LinearItemProps) {
	const { title, showTitle, seasonNumber, episodeNumber } = item as any;
	const { startDate, endDate } = schedule;
	const isEpisodeItem = isEpisode(item);
	const isOnNowItem = isOnNow(schedule);

	return (
		<Link to={path} onClick={onClick} className={cx(bem.b(), className)}>
			<Packshot
				className={bem.e('packshot')}
				item={item}
				imageType={imageType}
				imageOptions={imageOptions}
				titlePosition={'none'}
				allowProgressBar={false}
				onHoverClick={noop}
				onOverlayClick={noop}
				onPlayIconClick={noop}
				hasPlayIconAlwaysShown={hasPlayIconAlwaysShown}
				hasImageShadow={isOnNowItem}
				ignoreLink
			>
				{hasLogo && <ChannelLogo logo={channelLogo} title={channelShortCode} color={channelColor} />}
				{hasProgressBar && <LiveProgress from={startDate} to={endDate} color={channelColor} />}
				<PackshotOverlay isDark={isOnNowItem} className={bem.e('packshot-overlay')} />
			</Packshot>
			<ScheduleTime hasOnNowLabel={hasOnNowLabel} from={startDate} to={endDate} />
			<ScheduleTitle
				title={title}
				showTitle={showTitle}
				season={seasonNumber}
				episode={episodeNumber}
				isEpisode={isEpisodeItem}
			/>
		</Link>
	);
}

export default wrapLinear(LinearItem);
