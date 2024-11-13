import * as React from 'react';
import * as PropTypes from 'prop-types';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileBookmarks as key } from 'shared/page/pageKey';
import { getBookmarkList } from 'shared/service/profile';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import FavouriteList from './FavouriteList';
import { getRowTypeByImageType } from 'ref/tv/util/itemUtils';
import { getDefaultImageWidthByImageType } from 'ref/tv/util/itemUtils';
import { Bookmarks as BookmarksId } from 'shared/list/listId';
import DeviceModel from 'shared/util/platforms/deviceModel';

interface BookmarkProps extends PageProps {
	subscriptionCode: string;
	itemImageTypes: { [key: string]: string };
}

interface BookmarkState {
	bookMarkItemLists?: api.ItemList[];
	rowType?: { [key: string]: string };
	emptyMessage?: string;
}

const PAGE_SIZE = 24;
const itemDisplayTypes = [{ 0: 'movie' }, { 1: 'show' }, { 2: 'program' }];

class AccountProfileBookmarks extends React.Component<BookmarkProps, BookmarkState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	constructor(props: BookmarkProps) {
		super(props);

		this.state = {
			bookMarkItemLists: undefined,
			rowType: undefined,
			emptyMessage: ''
		};
	}

	componentDidMount() {
		this.getList();
	}

	componentDidUpdate() {
		if (this.context.focusNav.gotoPageFromMenu && (this.state.bookMarkItemLists || this.state.emptyMessage)) {
			this.context.focusNav.gotoPageFromMenu = false;
			this.context.focusNav.focusOnFirstRow();
			this.context.focusNav.scrollY();
		}
	}

	private getList = () => {
		const deviceType = DeviceModel.deviceInfo().type;
		const itemImageTypes = this.props.itemImageTypes;
		const itemList = [];
		const rowType = {};
		let showItemList: api.ItemList;
		let programItemList: api.ItemList;
		let displayItemList: api.ItemList;

		for (let key in itemImageTypes) {
			rowType[key] = getRowTypeByImageType(itemImageTypes[key]);
		}

		Promise.all(
			itemDisplayTypes.map((item, i) =>
				getBookmarkList({
					device: deviceType,
					pageSize: PAGE_SIZE,
					sub: this.props.subscriptionCode,
					itemType: item[i]
				})
			)
		).then(results => {
			results.forEach(result => {
				const { data } = result;

				if (data.items && data.items.length > 0) {
					const itemType = data.paging.options.itemType;
					const imageType = itemImageTypes[itemType];
					displayItemList = {
						id: itemType,
						items: data.items,
						paging: data.paging,
						path: data.path,
						size: data.size,
						title: data.title,
						itemTypes: [itemType],
						key: BookmarksId,
						customFields: { imageType: imageType, imageWidth: getDefaultImageWidthByImageType(imageType) }
					} as api.ItemList;

					if (itemType === 'show') {
						showItemList = displayItemList;
						return;
					}

					if (itemType === 'program') {
						programItemList = displayItemList;
						return;
					}

					itemList.push(displayItemList);
				}
			});

			if (showItemList) {
				if (programItemList) {
					showItemList.items = showItemList.items.concat(programItemList.items);
					showItemList.size += programItemList.size;
					showItemList.paging.total = Math.ceil(showItemList.size / PAGE_SIZE);
				}
			} else {
				showItemList = programItemList;
			}

			if (showItemList) {
				showItemList.id = 'show';
				itemList.push(showItemList);
			}

			if (itemList.length > 0) {
				this.context.focusNav.supportedEntriesCount = itemList.length;
				this.setState({ bookMarkItemLists: itemList, rowType: rowType });
			} else {
				this.context.focusNav.supportedEntriesCount = 1;
				this.setState({ emptyMessage: 'bookmark_empty_message' });
			}
		});
	};

	render() {
		const { bookMarkItemLists, rowType, emptyMessage } = this.state;
		const customFields = { assetTitlePosition: 'below' };

		return (
			<FavouriteList
				favouriteItemLists={bookMarkItemLists}
				rowType={rowType}
				emptyMessage={emptyMessage}
				customFields={customFields}
				title={this.props.title}
				location={this.props.location}
			/>
		);
	}
}

function mapStateToProps({ app, account }: state.Root) {
	return {
		itemImageTypes: app.config.general.itemImageTypes,
		subscriptionCode: account.info && account.info.subscriptionCode
	};
}

export default configPage(AccountProfileBookmarks, {
	key,
	template,
	mapStateToProps
} as any);
