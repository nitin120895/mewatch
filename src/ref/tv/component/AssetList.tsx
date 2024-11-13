import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { resolveImages, convertResourceToSrcSet } from 'shared/util/images';
import { Image as imageDetail } from 'shared/analytics/types/v3/context/entry';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Search as searchPageTemplate } from 'shared/page/pageTemplate';
import {
	AccountProfileWatched as AccountProfileWatchedKey,
	AccountProfileBookmarks as AccountProfileBookmarksKey
} from 'shared/page/pageKey';
import {
	Watched as watchedListId,
	Bookmarks as bookmarksListId,
	ContinueWatching as continueWatchingListId
} from 'shared/list/listId';
import Image from 'shared/component/Image';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import Asset from './Asset';
import ArrowButton from 'ref/tv/component/ArrowButton';
import BrandImage from 'ref/tv/component/BrandImage';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import { transform, wrapValue } from 'ref/tv/util/focusUtil';
import { checkHorizontalArrowDisplay } from 'ref/tv/util/domUtils';
import { addWatchPosition } from 'ref/tv/util/itemUtils';
import { setPaddingStyle } from 'ref/tv/util/rows';
import sass from 'ref/tv/util/sass';
import './AssetList.scss';

export interface AssetListProps extends PageEntryListProps {
	imageType: image.Type | image.Type[];
	imageWidth: number;
	firstImageType?: image.Type | image.Type[];
	firstImageWidth?: number;
	listHeight?: number;
	isDouble?: boolean;
	isImage?: boolean;
	listBrandImageType?: image.Type;
	listBGImageType?: image.Type;
	firstExternal?: boolean;
	focusable?: boolean;
	displayPlayIcon?: boolean;
	hasPaddingLeft?: boolean;
	curIndex?: number;
	refRowType?: string;
	rowHeight: number;
	verticalMargin?: number;
	isUserList?: boolean;
	entryImageDetails?: imageDetail;
	profile?: state.Profile;
	rowType: string;
}

type AssetListState = {
	isFocused: boolean;
	listTrans: number;
	selectedIndex: number;
	selectedItemId: string;
	list: api.ItemSummary[];
	listId: string;
	showPrevArrow: boolean;
	showNextArrow: boolean;
};

const bem = new Bem('asset-list');

/**
 * Asset List
 *
 * Displays a list of item Asset images (with optional titles) with support for horizontally scrolling a
 * single row, or vertical wrapping multiple rows.
 *
 * The image dimensions are calculated from the columns array to allow for responsive reflow within the grid.
 */
export default class AssetList extends React.Component<AssetListProps, AssetListState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
		detailHelper: DetailHelper;
	};

	static contextTypes = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired,
		detailHelper: PropTypes.object.isRequired
	};

	static listMargin = sass.listMargin;
	static itemMargin = sass.itemMargin;
	static pageContentMargin = 80;
	private ref: HTMLElement;
	private scrollArea: HTMLElement;
	private itemWidth: number;
	private listHeight: number;
	private focusableRow: Focusable;

	static defaultProps = {
		focusable: true
	};

	constructor(props) {
		super(props);

		this.itemWidth = props.imageWidth + AssetList.itemMargin;

		this.state = {
			listTrans: 0,
			selectedIndex: 0,
			selectedItemId: '',
			isFocused: false,
			list: [],
			listId: props.list.id,
			showPrevArrow: false,
			showNextArrow: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			refRowType: props.refRowType,
			height: 0,
			template: props.template,
			entryProps: props,
			entryImageDetails: props.entryImageDetails,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec,
			getLeftToViewport: this.getLeftToViewport
		};
	}

	componentDidMount() {
		if (this.scrollArea) {
			let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

			if (!entryNode) entryNode = this.scrollArea;

			setPaddingStyle(entryNode, this.props.customFields);

			const rowHeight = this.calcRowHeight();
			this.focusableRow.height = rowHeight;
			this.focusableRow.ref = this.ref && this.ref.parentElement;
		}

		if (this.props.focusable) {
			this.context.focusNav.registerRow(this.focusableRow);
			this.displayList();
		}

		if (this.context.detailHelper.pageTemplate === searchPageTemplate) {
			this.context.focusNav.pageResize();
		}
	}

	componentWillUnmount() {
		if (this.props.focusable) {
			this.context.focusNav.unregisterRow(this.focusableRow);
		}
	}

	componentDidUpdate() {
		if (this.props.focusable) {
			const { list, selectedIndex, selectedItemId } = this.state;
			const selectedItem = list[selectedIndex];
			this.displayList();
			this.focusableRow.savedState = Object.assign({}, this.state);

			// For normal list, just restore the saved state when user go back.
			// For user list, verify the selected item is still valid or has a new index when the list is updated.
			// If the selected item is invalid, the first item gets focus.
			if (
				this.props.isUserList &&
				list.length > 0 &&
				selectedItemId &&
				selectedItem &&
				selectedItem.id !== selectedItemId
			) {
				const shouldFocusIndex = list.findIndex(item => item.id === selectedItemId);

				if (shouldFocusIndex === -1) {
					this.setState({ selectedIndex: 0, selectedItemId: list[0].id, listTrans: 0 });
					return;
				}

				this.calcPosition(shouldFocusIndex);
				this.setState({ selectedIndex: shouldFocusIndex });
			}
		}
	}

	componentWillMount() {
		this.populateList(this.props);
	}

	componentWillReceiveProps(nextProps: AssetListProps) {
		const { list, curIndex, entryImageDetails, profile, isUserList } = nextProps;

		if (list.items !== this.props.list.items || profile !== this.props.profile) {
			this.populateList(nextProps);
			!isUserList && this.setState({ isFocused: false });
		}

		if (curIndex !== undefined && curIndex !== this.state.selectedIndex) {
			this.setState({ selectedIndex: curIndex, selectedItemId: this.state.list[curIndex].id });
		}

		this.focusableRow.entryProps = nextProps;
		this.focusableRow.entryImageDetails = entryImageDetails;
	}

	shouldComponentUpdate(nextProps, nextState: AssetListState) {
		if (nextState.listTrans !== this.state.listTrans) {
			this.context.focusNav.analytics.triggerEntryInteracted(nextProps, nextProps.entryImageDetails);
		}

		return true;
	}

	private displayList = () => {
		const rowDiv = this.context.focusNav.getRowEntry(this.props.index);

		if (this.state.list.length <= 0) {
			this.context.focusNav.unregisterRow(this.focusableRow);

			if (rowDiv) {
				rowDiv.classList.add('entry-hidden');
				this.focusableRow.focusable = false;
				this.focusableRow.height = 0;
			}

			return;
		} else {
			const rowHeight = this.calcRowHeight();
			this.context.focusNav.registerRow(this.focusableRow);

			if (rowDiv) {
				rowDiv.classList.remove('entry-hidden');
				this.focusableRow.focusable = true;
				this.focusableRow.height = rowHeight;
			}
		}
	};

	private calcRowHeight = (): number => {
		let { title, customFields, rowHeight, verticalMargin, template } = this.props;

		if (template === 'AH1' || template === 'AH2') return rowHeight;

		let hasTitle = false;
		this.listHeight = rowHeight;

		if (title) {
			rowHeight += sass.assetListTitleHeight;
			hasTitle = true;
		}

		if (customFields) {
			if (customFields.customTagline) {
				rowHeight += sass.assetListTaglineHeight;
				hasTitle = true;
			}

			if (customFields.assetTitlePosition && customFields.assetTitlePosition === 'below') {
				rowHeight += sass.assetBelowTitleTotalHeight;
				this.listHeight += sass.assetBelowTitleTotalHeight;
			}
		}

		if (hasTitle) {
			if (verticalMargin > 0) {
				rowHeight += sass.assetListTitlePaddingBottom;
				this.listHeight -= verticalMargin * 2;
			} else {
				rowHeight += sass.assetListTitleMarginBottom;
			}
		}

		if (this.scrollArea && this.scrollArea.clientHeight !== this.listHeight) {
			this.scrollArea.style.height = `${this.listHeight}px`;
		}

		return rowHeight;
	};

	private populateList = (props: AssetListProps) => {
		if (!props.list) return;

		const customLink = props.customFields && props.customFields['moreLinkUrl'];
		const moreLinkUrl = customLink || props.list.path;

		let list = [];
		if (props.firstExternal) {
			const { id, title, images } = props.list;
			if (id && title && moreLinkUrl && images) {
				list.push({ id, title, moreLinkUrl, images, type: 'link', path: moreLinkUrl });
			}
		}

		list = list.concat(props.list.items);

		if (!list || list.length === 0) {
			return;
		}

		if (props.list.size > 24) {
			list = list.slice(0, 23);
			list.push({
				id: 'viewall',
				type: 'link',
				title: 'View All',
				path: moreLinkUrl
			});
		} else if (customLink) {
			list.push({
				id: 'viewall',
				type: 'link',
				title: 'View All',
				path: customLink
			});
		}

		if (props.list.id === continueWatchingListId) {
			const { listData } = props.list;

			list.map((item, index) => {
				if (item.type === 'show') {
					const assetItem =
						listData &&
						listData.ContinueWatching &&
						listData.ContinueWatching.itemInclusions &&
						listData.ContinueWatching.itemInclusions[item.id];

					if (assetItem) {
						const { episode, season } = assetItem;
						if (episode && season) {
							episode.images = item.images;
							episode.title = item.title + ` - S${season.seasonNumber} E${episode.episodeNumber}`;
							list[index] = episode;
						}
					}
				}
			});
		}

		if ((props.list.id === continueWatchingListId || props.list.id === watchedListId) && props.profile) {
			addWatchPosition(props.profile, list);
		}

		const selectedIndex = Math.min(this.state.selectedIndex, list.length - 1);
		this.setState({ list, selectedIndex });
	};

	private restoreSavedState = (savedState: object) => {
		const state = savedState as AssetListState;
		const { list, isUserList } = this.props;

		if (state) {
			if (isUserList) {
				if (list.id === state.listId) {
					this.setState(
						{
							isFocused: state.isFocused,
							listTrans: 0,
							selectedIndex: 0,
							selectedItemId: state.selectedItemId,
							listId: state.listId
						},
						this.trackedItemFocused
					);
				} else {
					this.context.focusNav.focusOnFirstRow();
				}
			} else {
				this.setState(
					{
						isFocused: state.isFocused,
						listTrans: state.listTrans,
						selectedIndex: state.selectedIndex,
						selectedItemId: state.list[state.selectedIndex].id,
						list: state.list,
						listId: state.listId
					},
					this.trackedItemFocused
				);
			}
		}
	};

	private getLeftToViewport = () => {
		const { isDouble, firstImageType, hasPaddingLeft } = this.props;
		const { listTrans, selectedIndex } = this.state;
		const firstImageWidth = this.getFirstImageWidth();
		let position = selectedIndex;

		if (isDouble) {
			if (firstImageType) {
				position = Math.ceil(selectedIndex / 2) - 1;
			} else {
				position = Math.floor(selectedIndex / 2);
			}
		} else if (firstImageType) {
			position = selectedIndex - 1;
		}

		let leftToParent = Math.max(0, position * this.itemWidth);

		if (selectedIndex > 0 && firstImageType) {
			leftToParent = leftToParent + firstImageWidth + AssetList.itemMargin;
		}

		if (hasPaddingLeft) {
			leftToParent += firstImageWidth;
		}

		const leftToViewport = leftToParent + listTrans;

		return leftToViewport;
	};

	private calcFocusableIndex = (sourceLeftToViewport: number, directional?: 'up' | 'down'): number => {
		if (this.props.isDouble) {
			return this.calcIndexForDoubleRow(sourceLeftToViewport, directional);
		} else {
			return this.calcIndexForSingleRow(sourceLeftToViewport);
		}
	};

	private calcIndexForSingleRow = (sourceLeftToViewport: number): number => {
		const { firstImageType, hasPaddingLeft } = this.props;
		const { list, listTrans } = this.state;
		const firstImageWidth = this.getFirstImageWidth();
		const fullScreenWidth = sass.viewportWidth;
		let chooseIndex, eleLeftToViewport, eleRightToViewport;

		if (firstImageType) {
			// For pb1, sb1
			chooseIndex = Math.round((sourceLeftToViewport - listTrans - firstImageWidth) / this.itemWidth) + 1;
			chooseIndex = wrapValue(chooseIndex, 0, list.length - 1);
			eleLeftToViewport =
				chooseIndex === 0
					? listTrans + AssetList.pageContentMargin
					: this.itemWidth * chooseIndex +
					  listTrans +
					  AssetList.pageContentMargin -
					  this.itemWidth +
					  firstImageWidth +
					  AssetList.itemMargin;
			eleRightToViewport =
				chooseIndex === 0
					? eleLeftToViewport + firstImageWidth
					: eleLeftToViewport + this.itemWidth - AssetList.itemMargin;
		} else if (hasPaddingLeft) {
			// For pb2, pb3, pb4, sb2, sb3, sb4, tb2, tb3, tb4
			chooseIndex = Math.round((sourceLeftToViewport - listTrans - firstImageWidth) / this.itemWidth);
			chooseIndex = wrapValue(chooseIndex, 0, list.length - 1);
			eleLeftToViewport =
				this.itemWidth * chooseIndex + listTrans + AssetList.pageContentMargin + firstImageWidth + AssetList.itemMargin;
			eleRightToViewport = eleLeftToViewport + this.itemWidth - AssetList.itemMargin;
		} else {
			chooseIndex = Math.round((sourceLeftToViewport - listTrans) / this.itemWidth);
			chooseIndex = wrapValue(chooseIndex, 0, list.length - 1);
			eleLeftToViewport = this.itemWidth * chooseIndex + listTrans + AssetList.pageContentMargin;
			eleRightToViewport = eleLeftToViewport + this.itemWidth - AssetList.itemMargin;
		}

		if (eleRightToViewport > fullScreenWidth) {
			chooseIndex = Math.max(0, chooseIndex - 1);
		}

		if (eleLeftToViewport < 0) {
			chooseIndex = Math.min(list.length - 1, chooseIndex + 1);
		}

		return chooseIndex;
	};

	private calcIndexForDoubleRow = (sourceLeftToViewport: number, directional?: 'up' | 'down'): number => {
		const { firstImageType } = this.props;
		const { list, listTrans } = this.state;
		const firstImageWidth = this.getFirstImageWidth();
		const fullScreenWidth = sass.viewportWidth;
		const oddNumber = list.length % 2 === 1;
		let chooseIndex, eleLeftToViewport, eleRightToViewport;

		if (firstImageType) {
			// For tb1, t5
			const columnIndex = Math.round((sourceLeftToViewport - listTrans - firstImageWidth) / this.itemWidth);
			chooseIndex = columnIndex >= 0 ? columnIndex * 2 + 1 + (directional === 'up' ? 1 : 0) : 0;
			chooseIndex = wrapValue(
				chooseIndex,
				0,
				directional === 'up'
					? oddNumber
						? list.length - 1
						: list.length - 2
					: oddNumber
					? list.length - 2
					: list.length - 1
			);
			eleLeftToViewport =
				chooseIndex === 0
					? listTrans + AssetList.pageContentMargin
					: this.itemWidth * Math.floor((chooseIndex - 1) / 2) +
					  listTrans +
					  AssetList.pageContentMargin +
					  firstImageWidth +
					  AssetList.itemMargin;
			eleRightToViewport =
				chooseIndex === 0
					? eleLeftToViewport + firstImageWidth
					: eleLeftToViewport + this.itemWidth - AssetList.itemMargin;
		} else {
			chooseIndex =
				Math.round((sourceLeftToViewport - listTrans) / this.itemWidth) * 2 + (directional === 'up' ? 1 : 0);
			chooseIndex = wrapValue(
				chooseIndex,
				0,
				directional === 'up'
					? oddNumber
						? list.length - 2
						: list.length - 1
					: oddNumber
					? list.length - 1
					: list.length - 2
			);
			eleLeftToViewport = this.itemWidth * Math.ceil((chooseIndex - 1) / 2) + listTrans + AssetList.pageContentMargin;
			eleRightToViewport = eleLeftToViewport + this.itemWidth - AssetList.itemMargin;
		}

		if (eleRightToViewport > fullScreenWidth) {
			chooseIndex = Math.max(0, chooseIndex - 2);
		}

		if (eleLeftToViewport < 0) {
			chooseIndex = Math.min(list.length - 1, chooseIndex + 2);
		}

		return chooseIndex;
	};

	private trackedItemFocused = (isMouseLeave?: boolean) => {
		const { list, selectedIndex } = this.state;
		this.context.focusNav.analytics.triggerItemEvents(
			isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
			list[selectedIndex],
			this.props as any,
			selectedIndex,
			this.props.imageType,
			this.props.entryImageDetails
		);
	};

	private setFocus = (isFocus?: boolean, sourceLeftToViewport?: number, directional?: 'up' | 'down'): boolean => {
		const { list, isFocused } = this.state;

		if (!list || list.length <= 0) {
			return false;
		}

		if (isFocused !== isFocus) {
			this.setState({ isFocused: isFocus });

			if (isFocus) {
				const shouldFocusIndex = this.calcFocusableIndex(sourceLeftToViewport || 0, directional);

				if (shouldFocusIndex > -1) {
					this.setState(
						{ selectedIndex: shouldFocusIndex, selectedItemId: list[shouldFocusIndex].id },
						this.trackedItemFocused
					);
					return true;
				}
			} else {
				this.trackedItemFocused(true);
			}
		}

		return true;
	};

	private moveLeft = (): boolean => {
		const { isDouble, firstImageType } = this.props;
		let selectedIndex = this.state.selectedIndex;
		const prevIndex = selectedIndex;

		if (isDouble) {
			if (selectedIndex === 1 && firstImageType) {
				selectedIndex--;
			} else if (selectedIndex >= 2) {
				selectedIndex -= 2;
			}
		} else {
			selectedIndex--;
		}

		selectedIndex = Math.max(selectedIndex, 0);

		if (selectedIndex !== prevIndex) {
			if (selectedIndex !== 0) {
				this.setState({ selectedIndex, selectedItemId: this.state.list[selectedIndex].id }, this.trackedItemFocused);
			} else {
				this.setState({ selectedIndex, selectedItemId: this.state.list[0].id, listTrans: 0 }, this.trackedItemFocused);
			}
		}

		this.calcPosition(selectedIndex);

		return true;
	};

	private moveRight = (): boolean => {
		const { isDouble, firstImageType } = this.props;
		const { list } = this.state;

		if (list.length === 0) {
			return true;
		}

		let selectedIndex = this.state.selectedIndex;
		const prevIndex = selectedIndex;

		if (isDouble) {
			if (selectedIndex === 0 && firstImageType) {
				selectedIndex++;
			} else if (selectedIndex < list.length - 2) {
				selectedIndex += 2;
			}
		} else {
			selectedIndex++;
		}

		selectedIndex = Math.min(selectedIndex, list.length - 1);

		if (selectedIndex !== prevIndex) {
			this.setState({ selectedIndex, selectedItemId: this.state.list[selectedIndex].id }, this.trackedItemFocused);
		}

		this.calcPosition(selectedIndex);

		return true;
	};

	private moveUp = (): boolean => {
		const { isDouble, firstImageType } = this.props;
		let selectedIndex = this.state.selectedIndex;

		if (isDouble) {
			if (firstImageType) {
				if (selectedIndex > 0 && selectedIndex % 2 === 0) {
					selectedIndex--;
				}
			} else if (selectedIndex % 2 === 1) {
				selectedIndex--;
			}
		}

		if (selectedIndex !== this.state.selectedIndex) {
			this.setState({ selectedIndex, selectedItemId: this.state.list[selectedIndex].id }, this.trackedItemFocused);
			return true;
		}

		return false;
	};

	private moveDown = (): boolean => {
		const { isDouble, firstImageType } = this.props;
		let selectedIndex = this.state.selectedIndex;

		if (isDouble && selectedIndex < this.state.list.length - 1) {
			if (firstImageType) {
				if (selectedIndex > 0 && selectedIndex % 2 === 1) {
					selectedIndex++;
				}
			} else if (selectedIndex % 2 === 0) {
				selectedIndex++;
			}
		}

		if (selectedIndex !== this.state.selectedIndex) {
			this.setState({ selectedIndex, selectedItemId: this.state.list[selectedIndex].id }, this.trackedItemFocused);
			return true;
		}

		return false;
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
		const { list, selectedIndex } = this.state;
		const item = list[selectedIndex];
		this.context.focusNav.analytics.triggerItemEvents(
			'CLICK',
			item,
			this.props as any,
			selectedIndex,
			this.props.imageType,
			this.props.entryImageDetails
		);

		if (item) {
			switch (this.props.list.key) {
				case watchedListId:
				case continueWatchingListId:
					if (item.id === 'viewall') {
						this.context.router.push(
							item.path || getPathByKey(AccountProfileWatchedKey, this.context.detailHelper.config)
						);
					} else {
						const isEntitled = canPlay(item);

						if (isEntitled) {
							this.context.detailHelper.isInChainingPlay = false;
							this.context.focusNav.analytics.triggerItemWatched(true, item);
							this.context.router.push(item.watchPath);
						} else {
							this.context.router.push(item.path);
						}
					}
					return;
				case bookmarksListId:
					if (item.id === 'viewall') {
						this.context.router.push(
							item.path || getPathByKey(AccountProfileBookmarksKey, this.context.detailHelper.config)
						);
					} else {
						this.context.router.push(item.path);
					}
					return;
				default:
					if (item.type === 'trailer') {
						this.context.detailHelper.isInChainingPlay = false;
						this.context.focusNav.analytics.triggerItemWatched(true, item);
						this.context.router.push(item.watchPath);
					} else if (!item.type) {
						const data = item as any;
						let tarUrl;
						if (data.moreLinkUrl) {
							tarUrl = data.moreLinkUrl;
						} else {
							if (this.props.list && this.props.list.path) {
								tarUrl = this.props.list.path;
							}
						}
						this.context.router.push(tarUrl);
					} else {
						this.context.router.push(item.path);
					}
					return;
			}
		}
	};

	onRef = ref => {
		this.ref = ref;
	};

	onReference = ref => {
		this.scrollArea = ref;
	};

	private next = () => {
		this.shift(true);
	};

	private previous = () => {
		this.shift(false);
	};

	private calcPosition = (selectedIndex: number) => {
		const { isDouble, firstImageType, hasPaddingLeft } = this.props;
		const firstImageWidth = this.getFirstImageWidth();
		const { listTrans } = this.state;
		const contentClientWidth = this.scrollArea.clientWidth;
		const min = contentClientWidth - this.scrollArea.scrollWidth;
		let position;

		if (selectedIndex === 0) {
			const arrowDisplay = this.checkArrowDisplay(0);
			this.setState({
				showPrevArrow: arrowDisplay.showPrevArrow,
				showNextArrow: arrowDisplay.showNextArrow,
				listTrans: 0
			});
			return;
		}

		if (isDouble) {
			if (firstImageType) {
				position = Math.ceil(selectedIndex / 2) - 1;
			} else {
				position = Math.floor(selectedIndex / 2);
			}
		} else {
			if (firstImageType) {
				position = selectedIndex - 1;
			} else {
				position = selectedIndex;
			}
		}

		let left = Math.max(0, position * this.itemWidth);
		let right = left + this.itemWidth - AssetList.itemMargin;

		if (firstImageType) {
			if (position < 0) {
				left = 0;
				right = firstImageWidth;
			} else {
				left = left + firstImageWidth + AssetList.itemMargin;
				right = left + this.itemWidth - AssetList.itemMargin;
			}
		}

		if (hasPaddingLeft) {
			left += firstImageWidth;
			right += firstImageWidth;
		}

		if (left < Math.abs(listTrans)) {
			this.shift(false, left, right);
		}

		if (right - contentClientWidth > Math.abs(listTrans) || listTrans < min) {
			this.shift(true, left, right);
		}
	};

	private shift = (right: boolean, leftDistance?: number, rightDistance?: number, listTransDistance?: number) => {
		const { hasPaddingLeft } = this.props;
		const firstImageWidth = this.getFirstImageWidth();
		const contentClientWidth = this.scrollArea.clientWidth;
		const ipp = Math.floor((contentClientWidth + AssetList.itemMargin) / this.itemWidth);
		const min = contentClientWidth - this.scrollArea.scrollWidth;
		let distance = ipp * this.itemWidth;
		let { listTrans } = this.state;

		if (listTransDistance) listTrans = listTransDistance;

		if (right) {
			if (listTrans === 0 && firstImageWidth) {
				const firstWidth = firstImageWidth + (hasPaddingLeft ? 0 : AssetList.itemMargin);
				distance =
					firstWidth +
					Math.floor((contentClientWidth + AssetList.itemMargin - firstWidth) / this.itemWidth) * this.itemWidth;
			}

			listTrans -= distance;
			listTrans = Math.max(listTrans, min);
		} else {
			listTrans += distance;
			listTrans = Math.min(listTrans, 0);
		}

		if (listTrans !== 0 && leftDistance < Math.abs(listTrans)) {
			this.shift(false, leftDistance, rightDistance, listTrans);
			return;
		}

		if (listTrans !== min && rightDistance - contentClientWidth > Math.abs(listTrans)) {
			this.shift(true, leftDistance, rightDistance, listTrans);
			return;
		}

		const arrowDisplay = this.checkArrowDisplay(listTrans);

		this.setState({
			showPrevArrow: arrowDisplay.showPrevArrow,
			showNextArrow: arrowDisplay.showNextArrow,
			listTrans
		});
	};

	private checkArrowDisplay = (listTrans?: number) => {
		if (listTrans === undefined) {
			listTrans = this.state.listTrans;
		}

		return checkHorizontalArrowDisplay(listTrans, this.scrollArea.clientWidth, this.scrollArea.scrollWidth);
	};

	private handleMouseEnter = () => {
		if (!this.context.focusNav.disableMouseFocus) {
			this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);

			const arrowDisplay = this.checkArrowDisplay();
			this.setState({ showPrevArrow: arrowDisplay.showPrevArrow, showNextArrow: arrowDisplay.showNextArrow });
		}
	};

	private handleMouseLeave = () => {
		this.setState({ showPrevArrow: false, showNextArrow: false });
	};

	private assetMouseEnter = index => {
		if (!this.context.focusNav.disableMouseFocus)
			this.setState({ selectedIndex: index, selectedItemId: this.state.list[index].id }, this.trackedItemFocused);
	};

	private renderBrandedImage = () => {
		const {
			list,
			isImage,
			listBrandImageType,
			listBGImageType,
			customFields,
			listHeight,
			firstImageWidth,
			rowType
		} = this.props;

		if (!isImage) return;

		let brandHeight = listHeight;
		let topInset, topOutset, topEdge, bottomInset, bottomOutset, bottomEdge, leftInset, leftOutset, leftEdge;

		switch (customFields.breakoutTop) {
			case 'inset':
				brandHeight -= sass.brandedImageInsetHeight;
				topInset = true;
				break;
			case 'outset':
				brandHeight += sass.brandedImageOutsetHeight;
				topOutset = true;
				break;
			case 'edge':
				topEdge = true;
				break;
		}

		switch (customFields.breakoutBottom) {
			case 'inset':
				brandHeight -= sass.brandedImageInsetHeight;
				bottomInset = true;
				break;
			case 'outset':
				brandHeight += sass.brandedImageOutsetHeight;
				bottomOutset = true;
				break;
			case 'edge':
				bottomEdge = true;
				break;
		}

		switch (customFields.breakoutLeft) {
			case 'inset':
				leftInset = true;
				break;
			case 'outset':
				leftOutset = true;
				break;
			case 'edge':
				leftEdge = true;
				break;
		}

		const listBrandImageOption: image.Options = { height: brandHeight, format: 'png' };
		const listBrandImage = this.renderImage(list.images, listBrandImageType, listBrandImageOption);
		const listBGImageOption: image.Options = { height: listHeight };
		const listBGImage = this.renderImage(list.images, listBGImageType, listBGImageOption);
		const background = list.themes && list.themes.find(t => t.type === 'Background');
		const color = background && background.colors && background.colors[0].value;
		const moveOut = this.state.listTrans < -firstImageWidth;
		const brandTransform = transform(
			(moveOut ? -firstImageWidth : 0) + 'px',
			sass.transitionDuration,
			moveOut ? 0 : 300,
			false,
			undefined,
			true
		);
		const gradientTransform = transform(
			(moveOut ? -firstImageWidth : 0) + 'px',
			sass.transitionDuration,
			0,
			false,
			{ width: listBGImage.props.width, height: listBGImage.props.height },
			true
		);

		return (
			<div className={bem.e('image', rowType)} style={{ backgroundColor: color }}>
				{listBrandImageType === 'brand' ? (
					this.renderBrandTitle(brandTransform)
				) : (
					<div className={bem.e('bgImage', { moveOut })} style={gradientTransform}>
						{listBGImage}
						<div
							className={bem.e('brand', {
								topInset,
								topOutset,
								topEdge,
								bottomInset,
								bottomOutset,
								bottomEdge,
								leftInset,
								leftOutset,
								leftEdge
							})}
							style={brandTransform}
						>
							{listBrandImage}
						</div>
						<div
							className={bem.e('gradient')}
							style={{
								backgroundImage: `linear-gradient(to right, transparent, ${color})`
							}}
						/>
					</div>
				)}
			</div>
		);
	};

	private renderBrandTitle = (style: any) => {
		const { list, rowType, firstImageWidth, rowHeight } = this.props;
		const { images, themes, title, tagline } = list;
		const isBrandTitle = Array(images).filter(x => x && x.brand).length;
		const color = themes && themes.find(t => t.type === 'Text');
		const textColor = color && color.colors && color.colors[0].value;

		return (
			<div className={bem.e('brand-content', rowType)} style={style}>
				<div className={bem.e('brand-title', rowType)} style={{ color: textColor }}>
					{isBrandTitle ? (
						<BrandImage
							className={bem.e('title-image')}
							item={list}
							contentWidth={firstImageWidth / 0.4}
							contentHeight={rowHeight - sass.assetListBrandImagePadding * 2}
						/>
					) : (
						<div className={bem.e('title-text')}>{title}</div>
					)}
					{tagline && <div className={bem.e('brand-tagline')}>{tagline}</div>}
				</div>
			</div>
		);
	};

	private hasImages(imageTypes: image.Type[]): boolean {
		const {
			list: { images },
			listBrandImageType
		} = this.props;
		const listImages = (images && imageTypes.filter(imageType => images[imageType])) || [];
		return listImages.length > 0 || listBrandImageType === 'brand';
	}

	private getFirstImageWidth() {
		const { isImage, listBrandImageType, listBGImageType, firstImageWidth } = this.props;
		if (isImage && !this.hasImages([listBrandImageType, listBGImageType])) return 0;
		else return firstImageWidth;
	}

	private renderImage = (
		imagesGroup: { [key: string]: string },
		imageType: image.Type,
		imageOptions: image.Options
	) => {
		const defaultImageOptions = this.getDefaultImageOptions(imagesGroup, imageType, imageOptions);

		return (
			<Image
				srcSet={defaultImageOptions.sources}
				width={defaultImageOptions.displayWidth}
				height={defaultImageOptions.displayHeight}
			/>
		);
	};

	private getDefaultImageOptions(
		imagesGroup: { [key: string]: string },
		imageType: image.Type,
		imageOptions: image.Options
	) {
		const images = resolveImages(imagesGroup, imageType, imageOptions);
		const sources = images.map(source => convertResourceToSrcSet(source, true));
		const defaultImage = images[0];
		const displayWidth = defaultImage.displayWidth ? defaultImage.displayWidth : defaultImage.width;
		const displayHeight = defaultImage.displayHeight ? defaultImage.displayHeight : defaultImage.height;

		return { sources: sources, displayWidth: displayWidth, displayHeight: displayHeight };
	}

	private renderColumn(
		imageType: image.Type | image.Type[],
		imageOptions: image.Options,
		isDouble: boolean,
		index: number
	) {
		const { list, selectedIndex, isFocused } = this.state;
		const { customFields, displayPlayIcon } = this.props;
		const isLastItem = isDouble ? index === list.length - 1 || index === list.length - 2 : index === list.length - 1;
		const items = list.slice(index, index + (isDouble ? 2 : 1)).map((item, i) => {
			return (
				<Asset
					key={item.id + '-' + i}
					item={item}
					imageType={imageType}
					imageOptions={imageOptions}
					itemMargin={AssetList.itemMargin}
					focused={selectedIndex === index + i && isFocused}
					titlePosition={customFields && customFields.assetTitlePosition}
					displayPlayIcon={displayPlayIcon}
					isViewAll={item.id === 'viewall'}
					assetMouseEnter={this.context.focusNav.mouseActive ? this.assetMouseEnter : undefined}
					onClick={this.context.focusNav.mouseActive ? this.invokeItem : undefined}
					index={index + i}
					isLastItem={isLastItem}
					position={item.customFields && item.customFields.position}
				/>
			);
		});

		return isDouble ? (
			<div className={bem.e('column')} key={'column-' + index}>
				{items}
			</div>
		) : (
			items[0]
		);
	}

	render(): any {
		const {
			imageType,
			imageWidth,
			rowType,
			firstImageType,
			firstImageWidth,
			isImage,
			listBrandImageType,
			listBGImageType,
			isDouble,
			template
		} = this.props;
		const { list, showPrevArrow, showNextArrow, listTrans } = this.state;
		const styleTransform = transform(
			listTrans + 'px',
			sass.transitionDuration,
			0,
			false,
			{
				paddingLeft: isImage && this.hasImages([listBrandImageType, listBGImageType]) ? `${firstImageWidth}px` : 0,
				height: template !== 'AH1' && template !== 'AH2' ? `${this.listHeight}px` : 'auto'
			},
			true
		);

		return (
			<div
				className={bem.b()}
				ref={this.onRef}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				{this.renderBrandedImage()}
				<div ref={this.onReference} className={bem.e('list', rowType)} style={styleTransform}>
					{list &&
						list.map((item, i) => {
							if (i === 0 && firstImageType) {
								return this.renderColumn(firstImageType, { width: firstImageWidth }, false, 0);
							} else if (!isDouble || (!firstImageType && i % 2 === 0) || (firstImageType && i % 2 === 1)) {
								return this.renderColumn(imageType, { width: imageWidth }, isDouble, i);
							}

							return undefined;
						})}
				</div>

				<ArrowButton
					direction={'left'}
					className={bem.e('arrow', 'prev', { isImage }, isImage ? rowType : '')}
					onClick={this.previous}
					show={showPrevArrow}
				/>
				<ArrowButton
					direction={'right'}
					className={bem.e('arrow', 'next', { isImage }, isImage ? rowType : '')}
					onClick={this.next}
					show={showNextArrow}
				/>
			</div>
		);
	}
}
