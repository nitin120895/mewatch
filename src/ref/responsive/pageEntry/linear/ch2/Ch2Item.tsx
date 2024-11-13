import * as React from 'react';
import { PackshotProps } from 'ref/responsive/component/Packshot';
import { isLink } from 'ref/responsive/util/item';
import { isOnNow } from '../common/utils';
import withDelayedUpdate, { selectUpdateTimeByKey, WithProgressProps } from '../common/withDelayedUpdate';

import ViewFullSchedule from './ViewFullSchedule';
import LinearItem from '../common/LinearItem';

interface Ch2ItemSummary extends api.ItemSummary {
	schedule: api.ItemSchedule;
}

export interface Ch2ItemProps extends WithProgressProps {
	hasLogo?: boolean;
	hasProgressBar?: boolean;
	hasPlayIcon?: boolean;
	item: Ch2ItemSummary;
	channel: api.ItemSummary;
	imageType?: PackshotProps['imageType'];
	imageOptions?: PackshotProps['imageOptions'];
	onClick?: (e: React.SyntheticEvent<any>, item: Ch2ItemSummary) => void;
	channelColor?: api.ThemeColor;
	channelLogo?: string;
	className?: PackshotProps['className'];
}

class Ch2Item extends React.PureComponent<Ch2ItemProps> {
	private onClick = (e: React.SyntheticEvent<any>) => {
		const { item, onClick } = this.props;

		if (onClick) onClick(e, item);
	};

	render() {
		return isLink(this.props.item) ? this.renderViewFullSchedule() : this.renderLinearItem();
	}

	private renderViewFullSchedule() {
		const { item, className, channelColor } = this.props;

		return <ViewFullSchedule path={item.path} color={channelColor} className={className} />;
	}

	private renderLinearItem() {
		const {
			item,
			channel,
			channelColor,
			channelLogo,
			imageType,
			imageOptions,
			hasLogo,
			hasPlayIcon,
			hasProgressBar,
			className
		} = this.props;
		const isOnNowItem = isOnNow(item.schedule);
		const path = isOnNowItem ? channel.path : item.path;

		return (
			<LinearItem
				path={path}
				item={item}
				schedule={item.schedule}
				channel={channel}
				channelLogo={channelLogo}
				channelShortCode={(channel as any).channelShortCode}
				channelColor={channelColor}
				imageType={imageType}
				imageOptions={imageOptions}
				hasLogo={hasLogo}
				hasProgressBar={hasProgressBar && isOnNowItem}
				hasPlayIconAlwaysShown={hasPlayIcon && isOnNowItem}
				hasOnNowLabel
				onClick={this.onClick}
				className={className}
			/>
		);
	}
}

export default withDelayedUpdate(selectUpdateTimeByKey('item.schedule.startDate'))(Ch2Item);
