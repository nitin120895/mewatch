import * as React from 'react';
import Asset from 'ref/tv/component/Asset';

type ContinuousScrollListRowProps = {
	height: number;
	isFocused: boolean;
	selectedIndex: number;
	offset: number;
	items: api.ItemSummary[];
	itemProps: ItemProps;
	watchedList: { [key: string]: api.Watched };
};

type ItemProps = {
	imageType: image.Type | image.Type[];
	imageOptions: { width: number };
	itemMargin: number;
	titlePosition: string;
	className: string;
	onClick: () => void;
	assetMouseEnter: (index: number) => void;
	displayPlayIcon: boolean;
};

function checkWatchedPosition(watchedList: { [key: string]: api.Watched }) {
	if (!watchedList) return;
	return Object.values(watchedList).reduce((acc, value) => (acc += value.position + '-'), '');
}

function checksum(items: api.ItemDetail[]) {
	return items.reduce((acc, item) => (acc += item.id + '-'), '');
}

function hasSelection(props: ContinuousScrollListRowProps) {
	const { selectedIndex, offset, items } = props;
	return selectedIndex >= offset && selectedIndex - offset < items.length;
}

export default class ContinuousScrollListRow extends React.Component<ContinuousScrollListRowProps, {}> {
	private hasSelection: boolean;
	private checksum: string;
	private checkWatchedPosition: string;

	shouldComponentUpdate(nextProps: ContinuousScrollListRowProps) {
		const { isFocused, selectedIndex, items, watchedList } = this.props;
		const nextSelection = hasSelection(nextProps);
		// re-render only when:
		// - grid focus changed
		// - selectedIndex changed within the row
		// - (some) items changed
		return (
			nextProps.isFocused !== isFocused ||
			(nextSelection && nextProps.selectedIndex !== selectedIndex) ||
			nextSelection !== this.hasSelection ||
			(nextProps.items !== items && checksum(nextProps.items) !== this.checksum) ||
			(nextProps.watchedList !== watchedList &&
				checkWatchedPosition(nextProps.watchedList) !== this.checkWatchedPosition)
		);
	}

	componentDidUpdate() {
		this.hasSelection = hasSelection(this.props);
		this.checksum = checksum(this.props.items);
		this.checkWatchedPosition = checkWatchedPosition(this.props.watchedList);
	}

	render() {
		const { height, offset, items, itemProps, isFocused, selectedIndex } = this.props;
		return (
			<div style={{ position: 'relative', height: height + 'px' }}>
				{items.map((item, i) => (
					<Asset
						key={`${item.id}-${i}`}
						{...itemProps}
						index={offset + i}
						item={item}
						focused={isFocused && selectedIndex === offset + i}
						position={item.customFields && item.customFields.position}
					/>
				))}
			</div>
		);
	}
}
