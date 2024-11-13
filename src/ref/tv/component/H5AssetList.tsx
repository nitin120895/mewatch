import * as React from 'react';
import * as PropTypes from 'prop-types';
import Asset from './Asset';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { transform, skipMove, wrapValue } from 'ref/tv/util/focusUtil';
import sass from 'ref/tv/util/sass';
import { setPaddingStyle } from 'ref/tv/util/rows';
import './H5AssetList.scss';

interface H5AssetListProps extends PageEntryListProps {
	h5List: api.ItemSummary[];
	itemMargin?: number;
	imageType: image.Type | image.Type[];
	imageWidth: number;
	focusable?: boolean;
	curIndex?: number;
	onFocusTo?: (itemIndex: number) => void;
	rowType: 't1';
	focused: boolean;
}

interface H5AssetListState {
	focused?: boolean;
	selectedIndex?: number;
	list: api.ItemSummary[];
	maxItemIndex: number;
	alignMiddle: boolean;
}

const bem = new Bem('h5-asset-list');

/**
 * Asset List
 *
 * Displays a list of item Asset images (with optional titles) with support for horizontally scrolling a
 * single row, or vertical wrapping multiple rows.
 *
 * The image dimensions are calculated from the columns array to allow for responsive reflow within the grid.
 */
export default class H5AssetList extends React.Component<H5AssetListProps, H5AssetListState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	static itemMargin = sass.assetListItemMargin;
	static listPadding = sass.h5ListPadding;
	private scrollArea: HTMLElement;
	private itemWidth: number;
	private focusableRow: Focusable;

	static defaultProps = {
		focusable: true
	};

	constructor(props) {
		super(props);

		this.state = {
			selectedIndex: props.curIndex,
			focused: props.focused,
			list: [],
			maxItemIndex: props.h5List.length - 1,
			alignMiddle: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: sass.h5Height,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
	}

	componentDidMount() {
		if (this.props.focusable) {
			this.context.focusNav.registerRow(this.focusableRow);
		}

		if (this.scrollArea) {
			const entryNode = this.context.focusNav.getRowEntry(this.props.index);

			setPaddingStyle(entryNode, this.props.customFields);
			this.focusableRow.ref = this.scrollArea;
		}
	}

	componentWillUnmount() {
		if (this.props.focusable) {
			this.context.focusNav.unregisterRow(this.focusableRow);
		}
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	componentWillMount() {
		this.populateList(this.props);
	}

	componentWillReceiveProps(nextProps: H5AssetListProps) {
		if (nextProps !== this.props) {
			this.populateList(nextProps);
		}

		if (nextProps.curIndex !== undefined && nextProps.curIndex !== this.state.selectedIndex) {
			this.setState({ selectedIndex: nextProps.curIndex });
		}

		if (nextProps.focused !== this.state.focused) {
			this.setState({ focused: nextProps.focused });
		}

		if (nextProps.h5List) this.setState({ maxItemIndex: nextProps.h5List.length - 1 });

		this.focusableRow.entryProps = nextProps;
	}

	private populateList = (props: H5AssetListProps) => {
		if (!props.h5List) return;
		let list = [];
		list = list.concat(props.h5List);
		this.setState({ list, maxItemIndex: list.length - 1 });
	};

	private restoreSavedState = (savedState: object) => {
		const state = savedState as H5AssetListState;
		if (state) {
			this.setState({
				focused: state.focused,
				selectedIndex: state.selectedIndex,
				list: state.list,
				maxItemIndex: state.maxItemIndex,
				alignMiddle: state.alignMiddle
			});
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			focused: isFocus
		});

		return true;
	};

	private moveLeft = (): boolean => {
		const selectedIndex = wrapValue(this.state.selectedIndex - 1, 0, this.state.maxItemIndex, true);

		this.setState({
			selectedIndex
		});

		this.props.onFocusTo && this.props.onFocusTo(selectedIndex);

		return true;
	};

	private moveRight = (): boolean => {
		const { list } = this.state;

		if (list.length === 0) {
			return true;
		}

		const selectedIndex = wrapValue(this.state.selectedIndex + 1, 0, this.state.maxItemIndex, true);

		this.setState({
			selectedIndex
		});

		this.props.onFocusTo && this.props.onFocusTo(selectedIndex);

		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				this.invokeItem();
				return true;
			default:
				break;
		}

		return false;
	};

	private invokeItem = () => {
		if (this.state.selectedIndex >= 0) {
			this.context.router.push(this.state.list[this.state.selectedIndex].path);
		}
	};

	private onMouseEnterItem = i => {
		this.setState({ selectedIndex: i });
		this.props.onFocusTo && this.props.onFocusTo(i);
	};

	onReference = ref => {
		const { list } = this.state;
		const maxItemsCountPerScreen = ref && Math.floor(ref.clientWidth / this.itemWidth);
		this.setState({ alignMiddle: list.length < maxItemsCountPerScreen });
		this.scrollArea = ref;
	};

	render(): any {
		const { list, selectedIndex, focused, alignMiddle } = this.state;
		if (list.length === 0) return false;

		const { itemMargin, imageType, imageWidth, rowType, customFields } = this.props;
		this.itemWidth = imageWidth + H5AssetList.itemMargin * 2;

		let listTrans = 0;

		if (this.scrollArea && this.scrollArea.scrollWidth > 0) {
			const maxItemsCountPerScreen = Math.floor(this.scrollArea.clientWidth / this.itemWidth);
			const maxScreenCount = Math.ceil(list.length / maxItemsCountPerScreen);
			const curScreen = Math.floor(selectedIndex / maxItemsCountPerScreen);
			const scrollStep = this.itemWidth * maxItemsCountPerScreen;

			listTrans = -curScreen * scrollStep;

			if (curScreen > 0 && curScreen === maxScreenCount - 1) {
				// This is the last screen
				listTrans = this.scrollArea.clientWidth - this.scrollArea.scrollWidth + sass.h5ItemSpacing / 2;
			}
		}

		const styleTransform = alignMiddle
			? {}
			: transform(listTrans + 'px', sass.transitionDuration, 0, false, undefined, true);

		return (
			<div className={bem.b()}>
				<div ref={this.onReference} className={bem.e('list', rowType, { alignMiddle })} style={styleTransform}>
					{list.map((item, i) => {
						let imageOptions: image.Options = { width: imageWidth };

						return (
							<Asset
								key={`${item.id}-${i}`}
								index={i}
								item={item}
								imageType={imageType}
								imageOptions={imageOptions}
								itemMargin={itemMargin || 0}
								focused={selectedIndex === i && focused}
								titlePosition={customFields && customFields.assetTitlePosition}
								assetMouseEnter={this.onMouseEnterItem}
								onClick={this.invokeItem}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}
