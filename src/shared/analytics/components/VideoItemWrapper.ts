import * as React from 'react';
import { createElement } from 'react';
import { AnalyticsDomEventWrapper } from 'shared/analytics/components/AnalyticsDomEventWrapper';
import { DomEventSourceType, EventName, VideoEntryPoint } from 'shared/analytics/types/types';

interface VideoItemWrapperProps {
	children: JSX.Element;
	entryPoint: VideoEntryPoint;
	index?: number;
	item: api.ItemSummary;
	listSize?: number;
	selectedItem: api.ItemSummary;
}

function getEventData<P extends VideoItemWrapperProps>(props: P) {
	return () => {
		const { entryPoint, index, item, listSize, selectedItem } = props;
		return { entryPoint, index, item, listSize, selectedItem } as any;
	};
}

class VideoItemWrapper<P> extends React.Component<P & VideoItemWrapperProps> {
	render() {
		return createElement(
			AnalyticsDomEventWrapper,
			{
				events: [EventName.CLICK],
				getEventData: getEventData(this.props),
				sourceType: DomEventSourceType.VideoItem
			},
			this.props.children
		);
	}
}

export default VideoItemWrapper;
