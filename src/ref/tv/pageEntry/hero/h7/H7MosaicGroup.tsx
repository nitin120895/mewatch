import * as React from 'react';
import { focusedClass } from 'ref/tv/util/focusUtil';
import MosaicCell from 'ref/tv/pageEntry/hero/h7/MosaicCell';

type H7MosaicGroupProps = {
	className: string;
	groupIndex: number;
	groupTile: api.ItemSummary[];
	customFields: any;
	curIndex: number;
	isFocused: boolean;
	isVisible: boolean;
	itemClick: () => void;
	itemEnter: (index: number) => void;
};

export default class H7MosaicGroup extends React.Component<H7MosaicGroupProps, {}> {
	private hasSelection: boolean;

	shouldComponentUpdate(nextProps: H7MosaicGroupProps) {
		const hasSelection = getHasSelection(nextProps);
		const { isVisible, isFocused, groupTile, curIndex } = this.props;
		return (
			isVisible !== nextProps.isVisible ||
			this.hasSelection !== hasSelection ||
			isFocused !== nextProps.isFocused ||
			groupTile !== nextProps.groupTile ||
			(hasSelection && curIndex !== nextProps.curIndex)
		);
	}

	render() {
		const {
			className,
			isVisible,
			groupIndex,
			groupTile,
			customFields,
			isFocused,
			curIndex,
			itemEnter,
			itemClick
		} = this.props;
		this.hasSelection = getHasSelection(this.props);

		return (
			<div className={className} data-key={groupIndex + 1}>
				{isVisible &&
					groupTile.map((item, i) => {
						let index = groupIndex * 3 + i;
						let focusedClassName = isFocused && curIndex === index ? focusedClass : '';
						return (
							<MosaicCell
								index={index}
								key={`cell-${i}`}
								className={focusedClassName}
								item={item}
								isPrimary={i === 0}
								customFields={customFields}
								onMouseEnter={itemEnter}
								onClick={itemClick}
							/>
						);
					})}
			</div>
		);
	}
}

function getHasSelection(props: H7MosaicGroupProps) {
	const { curIndex, groupIndex } = props;
	return curIndex >= groupIndex * 3 && curIndex < (groupIndex + 1) * 3;
}
