import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { getColumnClasses } from 'ref/responsive/util/grid';
import Scrollable from 'ref/responsive/component/Scrollable';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import { ChannelScheduleProps } from '../../../component/ChannelSchedule';
import { isChannel } from '../../../util/epg';
import { get } from 'shared/util/objects';
import { EPG as EpgPageKey } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { connect } from 'react-redux';

export type DREpgItemComponent = React.ComponentClass<ChannelScheduleProps>;

interface Epg5Props extends PageEntryListProps {
	itemComponent: DREpgItemComponent;
	columns?: grid.BreakpointColumn[];
	item?: api.ItemDetail;
	loadNextListPage: (list: api.ItemList) => {};
	config?: state.Config;
}

const bem = new Bem('dr-epg');

const DEFAULT_COLUMNS = [{ phone: 24 }, { phablet: 12 }, { laptop: 12 }, { desktop: 6 }, { desktopWide: 6 }];

class EpgList extends React.Component<Epg5Props, {}> {
	private scroller: Scrollable;
	private itemColumnClasses = getColumnClasses(DEFAULT_COLUMNS);

	constructor(props) {
		super(props);
		if (props.columns) {
			this.itemColumnClasses = getColumnClasses(props.columns);
		}
	}

	componentDidUpdate(prevProps) {
		const { list } = this.props;
		const page = get(list, 'paging.page');
		const prevPage = get(prevProps.list, 'paging.page');
		if (prevProps.list !== list && page === prevPage) {
			this.restoreScrollPosition();
		}
	}

	private restoreScrollPosition() {
		const { savedState, list } = this.props;
		if (this.scroller && savedState && list && list.size > 0) {
			this.scroller.restoreScrollPosition(savedState.scrollX || 0);
		}
	}

	private onScroll = (scrollX: number) => {
		const { savedState } = this.props;
		if (savedState) savedState.scrollX = scrollX;
	};

	onLoadNext = () => {
		const { list, loadNextListPage } = this.props;
		if (loadNextListPage && list.items && list.items.length < list.size) {
			loadNextListPage(list);
		}
	};

	private onScrollerRef = ref => (this.scroller = ref);

	render() {
		const { list, item, config, customFields } = this.props;
		const channelList = list.items && list.items.filter(isChannel);
		const channels = item ? this.modifyChannelList(channelList) : channelList;
		const moreLinkUrl = get(customFields, 'linkUrl') || getPathByKey(EpgPageKey, config);
		return (
			<div className={bem.b()}>
				<EntryTitle
					{...this.props}
					customFields={{
						moreLinkUrl
					}}
				/>
				<Scrollable
					className="row-peek"
					length={list.items.length}
					onScroll={this.onScroll}
					ref={this.onScrollerRef}
					onLoadNext={this.onLoadNext}
				>
					{channels.map((item, index) => this.renderColumn(item, index))}
				</Scrollable>
			</div>
		);
	}

	private modifyChannelList(channelList: api.ItemSummary[]) {
		const activeChannel: api.ItemDetail = channelList.find(channel => channel.id === this.props.item.id);
		channelList = channelList.filter(channel => channel !== activeChannel);
		if (activeChannel) {
			channelList.unshift(activeChannel);
		}
		return channelList;
	}

	private renderColumn = (item: api.ItemSummary, index) => {
		const Item = this.props.itemComponent;
		return <Item key={item.id} item={item} index={index} className={cx(...this.itemColumnClasses)} />;
	};
}

function mapStateToProps(state: state.Root) {
	return {
		config: state.app.config
	};
}

const Component: any = connect<any, any, EpgList>(mapStateToProps)(EpgList);
export default Component;
