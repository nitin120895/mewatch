import * as React from 'react';
import { ChannelScheduleEntityProps } from '../common/types';
import {
	CH2_MAX_TILES_WITH_ON_NOW,
	getCH2RowListWithFullSchedule,
	getChannelBackgroundColor,
	resolveChannelLogo
} from '../common/utils';
import PackshotList from 'ref/responsive/component/PackshotList';
import Ch2Item, { Ch2ItemProps } from './Ch2Item';
import NoSchedule from '../common/NoSchedule';
import withOutstandingChannelSchedule from '../common/withOutstandingChannelSchedule';

export const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];
const TIME_LIMIT = 24;

interface Ch2ChannelScheduleProps extends ChannelScheduleEntityProps {
	item: api.ItemSummary;
	savedState: any;
	customFields: api.ItemSummary['customFields'];
	onItemClick?: Ch2ItemProps['onClick'];
}

class Ch2ChannelSchedule extends React.PureComponent<Ch2ChannelScheduleProps> {
	private channelColor: api.ThemeColor;
	private channelLogo: string;

	constructor(props) {
		super(props);

		this.channelColor = getChannelBackgroundColor(props.item);
		this.channelLogo = resolveChannelLogo(props.item);
	}

	render() {
		const { schedules, loading } = this.props;

		if (loading) return false;

		return schedules.length ? this.renderPackshotList() : <NoSchedule />;
	}

	private renderPackshotList() {
		const { item, savedState, customFields, schedules, onItemClick } = this.props;
		const { showChannelLogo, moreLinkUrl } = customFields;
		const list = getCH2RowListWithFullSchedule(item, schedules, moreLinkUrl);

		return (
			<PackshotList
				list={list}
				imageType={'tile'}
				savedState={savedState}
				columns={columns}
				component={props => {
					const isFirstItem = !props.index;

					return (
						<Ch2Item
							{...props}
							key={props.id}
							channel={item}
							channelColor={this.channelColor}
							channelLogo={this.channelLogo}
							hasPlayIcon={isFirstItem}
							hasProgressBar={isFirstItem}
							hasLogo={showChannelLogo && isFirstItem}
							hasDelayedUpdated={isFirstItem}
							onClick={onItemClick}
						/>
					);
				}}
			/>
		);
	}
}

export default withOutstandingChannelSchedule(CH2_MAX_TILES_WITH_ON_NOW, TIME_LIMIT)(Ch2ChannelSchedule);
