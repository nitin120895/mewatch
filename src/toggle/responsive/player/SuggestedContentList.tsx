import * as React from 'react';
import * as cx from 'classnames';

import { tileColumns } from 'ref/responsive/pageEntry/branded/columns';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import { bem as packshotListBem } from 'toggle/responsive/component/PackshotList';
import { getUpdatedItem } from 'toggle/responsive/page/item/itemUtil';
import { isChannel } from 'toggle/responsive/util/epg';
import { calculateMedianWidth, getColumnClasses } from 'toggle/responsive/util/grid';
import { isEpisode } from 'toggle/responsive/util/item';

import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import VideoItemWrapper from 'shared/analytics/components/VideoItemWrapper';
import Packshot from 'toggle/responsive/component/Packshot';
import Scrollable from 'toggle/responsive/component/Scrollable';

import 'toggle/responsive/component/PackshotList.scss';

export interface SuggestedContentListProps {
	list: api.ItemList;
	videoItem: api.ItemDetail;
}

export interface SuggestedContentListState {
	updatedList: api.ItemSummary[];
}

class SuggestedContentList extends React.Component<SuggestedContentListProps, SuggestedContentListState> {
	constructor(props) {
		super(props);
		this.state = {
			updatedList: props.list.items
		};
	}

	componentDidMount(): void {
		const { items } = this.props.list;

		// Get updated item for Mixpanel video_end_reco_card_click event
		const promiseList = items.map(item => (isEpisode(item) ? getUpdatedItem(item.id) : Promise.resolve(item)));

		Promise.all(promiseList).then(result => {
			this.setState({ updatedList: result });
		});
	}

	render() {
		const { updatedList } = this.state;
		const hasSecondaryTitle = updatedList.some(item => !!item.secondaryLanguageTitle);

		const classes = cx(
			packshotListBem.b('tile'),
			'player-row-peek',
			{ 'row-peek': true },
			{ 'title-below': true },
			{ 'has-secondary': hasSecondaryTitle }
		);

		return (
			<Scrollable className={classes} length={updatedList.length} columns={tileColumns}>
				{this.renderList(updatedList)}
			</Scrollable>
		);
	}

	private renderList(list) {
		const packshotClasses = cx(packshotListBem.e('packshot'), ...getColumnClasses(tileColumns));

		return list.map((item, i) => this.renderPackshot(i, item, packshotClasses));
	}

	private renderPackshot(index, item, className = undefined) {
		const { list, videoItem } = this.props;
		const imageOptions: image.Options = {
			width: calculateMedianWidth(tileColumns)
		};

		const isWatchable = isChannel(item);

		const PackshotComponent = Packshot;
		const PackshotChild = (
			<VideoItemWrapper
				key={`${item.id}-${index}`}
				entryPoint={VideoEntryPoint.EOPRecommendation}
				index={index}
				item={videoItem}
				listSize={list.size}
				selectedItem={item}
			>
				<PackshotComponent
					className={cx(packshotListBem.e('packshot'), className)}
					index={index}
					item={item}
					imageType="tile"
					imageOptions={imageOptions}
					titlePosition="below"
					hasHover={false}
					hasOverlay={true}
					hasPlayIcon={true}
					showPartnerLogo={true}
					isEpisodeItem={isEpisode(item)}
					listData={list}
				/>
			</VideoItemWrapper>
		);

		return isWatchable ? (
			<CTAWrapper type={CTATypes.Watch} data={{ item, entryPoint: VideoEntryPoint.EOPRecommendation }} key={item.id}>
				{PackshotChild}
			</CTAWrapper>
		) : (
			PackshotChild
		);
	}
}

export default SuggestedContentList;
