import * as React from 'react';
import * as PropTypes from 'prop-types';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileWatched as key } from 'shared/page/pageKey';
import { getWatchedList, GetWatchedListOptions } from 'shared/service/profile';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { addWatchPosition } from 'ref/tv/util/itemUtils';
import { renderMessage } from './FavouriteList';
import ContinuousScrollList, { ContinuousScrollListProps } from 'ref/tv/pageEntry/continuous/ContinuousScrollList';
import { Bem } from 'shared/util/styles';
import H10Text from 'ref/tv/pageEntry/hero/h10/H10Text';
import sass from 'ref/tv/util/sass';
import DeviceModel from 'shared/util/platforms/deviceModel';
import './AccountProfileStyles.scss';

const bem = new Bem('profile-watched');
const headerStyle = { color: '#007bc7', opacity: 100 };
const PAGE_SIZE = 50;

interface WatchedProps extends PageProps {
	subscriptionCode: string;
	profile: state.Profile;
}

interface WatchedState {
	watchedItems?: api.ItemList;
	emptyMessage?: string;
	customFields?: { [key: string]: Object };
}

export class AccountProfileWatched extends React.Component<WatchedProps & ContinuousScrollListProps, WatchedState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	constructor(props: WatchedProps & ContinuousScrollListProps) {
		super(props);

		this.state = {
			watchedItems: undefined,
			emptyMessage: '',
			customFields: {
				subheading: undefined,
				backgroundColor: headerStyle,
				textHorizontalAlignment: 'left',
				assetTitlePosition: 'overlay',
				displayPlayIcon: true
			}
		};
	}

	componentDidMount() {
		this.getList();
	}

	componentWillReceiveProps(nextProps: WatchedProps & ContinuousScrollListProps) {
		if (nextProps.profile && nextProps.profile !== this.props.profile) {
			this.getList(1, true);
		}
	}

	private getList = (pageNum = 1, refresh?: boolean) => {
		const deviceType = DeviceModel.deviceInfo().type;
		const option = {
			device: deviceType,
			page: pageNum,
			pageSize: PAGE_SIZE,
			orderBy: 'date-modified',
			sub: this.props.subscriptionCode
		} as GetWatchedListOptions;
		let displayItemList: api.ItemList;

		getWatchedList(option).then(results => {
			const { watchedItems } = this.state;
			const { data } = results;

			if (data.items && data.items.length > 0) {
				if (!refresh && watchedItems && watchedItems.items.length > 0) {
					if (watchedItems.items.length >= data.size || pageNum > data.paging.total) return;
					data.items = watchedItems.items.concat(data.items);
				}

				displayItemList = {
					id: data.id,
					items: data.items,
					paging: data.paging,
					path: data.path,
					size: data.size,
					title: data.title
				} as api.ItemList;

				addWatchPosition(this.props.profile, displayItemList.items);
				this.context.focusNav.supportedEntriesCount = 2;
				this.setState({ watchedItems: displayItemList });
			} else {
				this.context.focusNav.supportedEntriesCount = 1;
				this.setState({ emptyMessage: 'watched_history_empty_message' });
			}
		});
	};

	render() {
		const { watchedItems, emptyMessage, customFields } = this.state;

		return (
			<div>
				<H10Text
					{...this.props}
					text={this.props.title}
					title={this.props.title}
					customFields={customFields}
					template={'H10'}
					index={0}
					type={'TextEntry'}
				/>
				{this.renderProfileWatchedlist(watchedItems, emptyMessage, customFields)}
			</div>
		);
	}

	private renderProfileWatchedlist = (watchedItems, emptyMessage, customFields) => {
		if (watchedItems && watchedItems.items.length > 0) {
			return (
				<div className={bem.e('list content-margin')}>
					<ContinuousScrollList
						{...this.props}
						customFields={customFields}
						list={watchedItems}
						imageType={'tile'}
						imageWidth={sass.tileImageWidth}
						itemsPerRow={5}
						index={1}
						loadNextPage={this.getList}
						template={'CS2'}
						type={'ListEntry'}
						isUserList
					/>
				</div>
			);
		} else {
			if (emptyMessage) {
				return <div className={bem.e('empty')}>{renderMessage(emptyMessage)}</div>;
			}
		}
	};
}

function mapStateToProps({ account, profile }: state.Root) {
	return { subscriptionCode: account.info && account.info.subscriptionCode, profile };
}

export default configPage(AccountProfileWatched, {
	key,
	template,
	mapStateToProps
} as any);
