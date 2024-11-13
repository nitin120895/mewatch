import * as React from 'react';
import { throttle } from 'shared/util/performance';
import Scrollable from 'ref/responsive/component/Scrollable';
import { getNavContentPackshotProps } from 'shared/app/navUtil';
import Packshot from 'ref/responsive/component/Packshot';

interface NavScrollableListProps {
	className: string;
	packshotClassName: string;
	list: api.ItemList;
	imageType: image.Type;
	allowProgressBar: boolean;
	loadNextListPage: (list: api.ItemList) => {};
}

interface NavScrollableListState {
	dummyItems?: api.ItemSummary[];
}

const LOAD_THROTTLE_TIME_MS = 250;

export default class NavScrollableList extends React.Component<NavScrollableListProps, NavScrollableListState> {
	private onLoadNextItemsThrottled: (e?: UIEvent) => void;

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

	private getItemsList(list: api.ItemList) {
		return list.items.concat(this.state.dummyItems);
	}

	private getDummyItems() {
		const { list } = this.props;
		const expectingItemsSize = list.size - list.items.length;
		const episodesCount = expectingItemsSize < list.paging.size ? expectingItemsSize : list.paging.size;
		const episodesItems = [];
		for (let i = 0; i < episodesCount; ++i) {
			episodesItems.push({ id: i, path: '', type: '' });
		}

		return episodesItems;
	}

	private onLoadNext = () => {
		this.onLoadNextItemsThrottled();
	};

	private onLoadNextItems = () => {
		const { list, loadNextListPage } = this.props;
		if (loadNextListPage && list.items && list.items.length < list.size) {
			this.setState({ dummyItems: this.getDummyItems() });
			loadNextListPage(list);
		}
	};

	render() {
		const { className, list } = this.props;
		if (!list) return;

		const itemsList = this.getItemsList(list);
		return (
			<Scrollable className={className} length={itemsList.length} onLoadNext={this.onLoadNext}>
				{itemsList.map(this.renderPackshot)}
			</Scrollable>
		);
	}

	private renderPackshot = (item: api.ItemSummary): any => {
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
