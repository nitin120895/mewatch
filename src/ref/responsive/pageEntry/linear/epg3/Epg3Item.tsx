import * as React from 'react';
import { compose } from 'redux';
import { ChannelScheduleEntityProps } from '../common/types';
import { resolveChannelLogo, getChannelBackgroundColor, isOnNow } from '../common/utils';
import { PackshotProps } from '../../../component/Packshot';
import { get } from 'shared/util/objects';
import NoAiring from '../common/NoAiring';
import LinearItem from '../common/LinearItem';
import withDelayedUpdate, { selectUpdateTimeByKey } from '../common/withDelayedUpdate';
import withOutstandingChannelSchedule from '../common/withOutstandingChannelSchedule';

const EPG3_SUPPORTED_TYPES = ['movie', 'program', 'episode'];
const ASSET_LIMIT = 2;
const TIME_LIMIT = 8;

class Epg3Item extends React.PureComponent<ChannelScheduleEntityProps & PackshotProps> {
	private channelColor: api.ThemeColor;
	private channelLogo: string;

	constructor(props) {
		super(props);

		this.channelColor = getChannelBackgroundColor(props.item);
		this.channelLogo = resolveChannelLogo(props.item);
	}

	render() {
		const { currentProgram, noScheduledItem } = this.props;
		const itemType = get(currentProgram, 'item.type');
		const isSupportedItem = EPG3_SUPPORTED_TYPES.includes(itemType);
		const isOnNowItem = isOnNow(currentProgram);

		return noScheduledItem || !isSupportedItem || !isOnNowItem ? this.renderNoAiring() : this.renderLinearItem();
	}

	private renderNoAiring() {
		const { item, currentProgram, className } = this.props;

		return (
			<NoAiring
				item={currentProgram.item as any}
				schedule={currentProgram}
				channel={item}
				path={item.path}
				channelLogo={this.channelLogo}
				channelTitle={(item as any).channelShortCode}
				channelColor={this.channelColor}
				className={className}
			/>
		);
	}

	private renderLinearItem() {
		const { item, currentProgram, imageOptions, imageType, className } = this.props;

		return (
			<LinearItem
				key={currentProgram.item.id}
				path={item.path}
				item={currentProgram.item as any}
				schedule={currentProgram}
				channel={item}
				channelLogo={this.channelLogo}
				channelShortCode={(item as any).channelShortCode}
				channelColor={this.channelColor}
				imageType={imageType}
				imageOptions={imageOptions}
				hasLogo
				hasProgressBar
				hasPlayIconAlwaysShown
				className={className}
			/>
		);
	}
}

export default compose(
	withOutstandingChannelSchedule(ASSET_LIMIT, TIME_LIMIT),
	withDelayedUpdate(selectUpdateTimeByKey('currentProgram.startDate'))
)(Epg3Item);
