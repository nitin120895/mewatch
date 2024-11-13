import * as React from 'react';
import { throttle } from 'shared/util/performance';
import * as cx from 'classnames';
import { getNavContentPackshotProps } from 'shared/app/navUtil';
import Packshot from 'ref/responsive/component/Packshot';
import Scrollable, { AdaptiveScroll } from 'toggle/responsive/component/Scrollable';
import { getDummyItems } from 'shared/list/listUtil';
import { isContinueWatching } from 'shared/list/listUtil';

interface NavScrollableListProps {
	className: string;
	packshotClassName?: string;
	list: api.ItemList;
	imageType?: image.Type;
	allowProgressBar: boolean;
	loadNextListPage: (list: api.ItemList) => {};
	renderChannel?: (channel: api.ItemSummary) => JSX.Element;
	setScrollContainerRef?: (ref: Scrollable) => void;
	getScrolableAdaptiveScroll?: AdaptiveScroll;
	checkNeedToResize?: () => boolean;
	stopEventPropagation?: boolean;
	resetEndPosition?: boolean;
}

interface NavScrollableListState {
	dummyItems?: api.ItemSummary[];
}

const LOAD_THROTTLE_TIME_MS = 250;

export default class NavScrollableList extends React.Component<NavScrollableListProps, NavScrollableListState> {
	onLoadNextItemsThrottled: (e?: UIEvent) => void;
	scrollContainer: Scrollable;

	constructor(props, context) {
		super(props);

		this.onLoadNextItemsThrottled = throttle(this.onLoadNextItems, LOAD_THROTTLE_TIME_MS, true);

		this.state = {
			dummyItems: []
		};
	}

	componentWillReceiveProps(nextProps, nextContext) {
		if (this.props.list !== nextProps.list) {
			this.setState({ dummyItems: [] });
		}
	}

	getItemsList(list: api.ItemList) {
		return list.items.concat(this.state.dummyItems);
	}

	onLoadNext = () => {
		this.onLoadNextItemsThrottled();
	};

	onLoadNextItems = () => {
		const { list, loadNextListPage } = this.props;
		if (loadNextListPage && list.items && list.items.length < list.size) {
			this.setState({ dummyItems: getDummyItems(list) });
			loadNextListPage(list);
		}
	};

	setScrollContainerRef = (ref: Scrollable) => {
		if (!this.scrollContainer && this.props.setScrollContainerRef) {
			this.props.setScrollContainerRef(ref);
		}
	};

	stopEventPropagation = e => {
		if (this.props.stopEventPropagation) {
			e.stopPropagation();
		}
	};

	render() {
		const {
			className,
			list,
			getScrolableAdaptiveScroll,
			checkNeedToResize,
			renderChannel,
			resetEndPosition
		} = this.props;
		if (!list) return;
		const continueWatching = isContinueWatching(list);
		const itemsList = this.getItemsList(list);
		return (
			<div onTouchMove={this.stopEventPropagation}>
				<Scrollable
					ref={this.setScrollContainerRef}
					className={cx(className, { 'continue-watching': continueWatching })}
					length={itemsList.length}
					onLoadNext={this.onLoadNext}
					adaptiveScroll={getScrolableAdaptiveScroll}
					needToResize={checkNeedToResize}
					wrap={true}
					resetEndPosition={resetEndPosition}
				>
					{itemsList.map(renderChannel ? renderChannel : this.renderPackshot)}
				</Scrollable>
			</div>
		);
	}

	renderPackshot = (item: api.ItemSummary): any => {
		const { list, imageType, packshotClassName, allowProgressBar } = this.props;
		return (
			<Packshot
				{...getNavContentPackshotProps(list, item, imageType)}
				className={packshotClassName}
				key={item.id}
				tabEnabled
				allowProgressBar={allowProgressBar}
				hasOverlay={false}
				hasPlayIcon={false}
				hasHover={false}
			/>
		);
	};
}
