import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { configPage } from 'shared/';
import { H9Image, XED3 } from 'shared/page/pageEntryTemplate';
import { LiveChannels as template } from 'shared/page/pageTemplate';
import { normalizeString } from 'shared/page/pageUtil';
import ChannelFilter from 'toggle/responsive/page/liveChannels/channelDropdown/ChannelFilter';
import { ChannelFilterListLabels } from 'toggle/responsive/page/liveChannels/channelDropdown/ChannelFilterList';
import entryRenderers from 'toggle/responsive/page/liveChannels/LiveChannelsEntries';

import './LiveChannels.scss';

interface LiveChannelsProps extends PageProps {
	entries: api.PageEntry[];
}

interface LiveChannelsState {
	selectedChannel: string;
}

const bem = new Bem('all-channels');

class LiveChannels extends React.Component<LiveChannelsProps, LiveChannelsState> {
	constructor(props) {
		super(props);
		this.state = {
			selectedChannel: ChannelFilterListLabels.ALL_CHANNELS
		};
	}

	componentDidMount() {
		const { entries } = this.props;
		if (entries && entries.length) {
			this.parseChannelUrlParams();
		}
	}

	componentDidUpdate(prevProps: LiveChannelsProps) {
		if (prevProps.loading && !this.props.loading) {
			this.parseChannelUrlParams();
		}
	}

	parseChannelUrlParams() {
		const { entries } = this.props;
		const queryString = window.location.search;
		const railTitleUrlParams = queryString.includes('?filter') ? queryString.split('?filter=')[1] : '';

		if (railTitleUrlParams && Array.isArray(entries) && entries.length > 0) {
			const filtered = entries.find(entry => normalizeString(entry.title) === normalizeString(railTitleUrlParams));
			const selectedTitle = filtered ? filtered.title : ChannelFilterListLabels.ALL_CHANNELS;
			this.setState({ selectedChannel: selectedTitle });
		}
	}

	renderHeaderEntry() {
		const { entries, renderEntry } = this.props;
		const headerEntry = entries && entries.find(entry => entry.template === H9Image);

		if (!headerEntry) {
			/* tslint:disable-next-line:no-null-keyword */
			return null;
		}
		return renderEntry(headerEntry, 0);
	}

	updateFilterChannel = (filterChannel: string) => {
		this.setState({ selectedChannel: filterChannel });
	};

	renderChannelFilter() {
		const { entries } = this.props;
		const { selectedChannel } = this.state;
		const channelEntries = (entries || []).filter(entry => entry.template !== H9Image);
		return (
			entries && (
				<ChannelFilter
					selectedChannel={selectedChannel}
					updateFilterChannel={this.updateFilterChannel}
					channelData={channelEntries}
				/>
			)
		);
	}

	renderRailEntries() {
		const { entries, renderEntry } = this.props;
		const { selectedChannel } = this.state;
		const excludedTemplates = [H9Image, XED3];
		const filterChannelSelection = (entry: api.PageEntry) =>
			selectedChannel === ChannelFilterListLabels.ALL_CHANNELS || entry.title === selectedChannel;
		const filterCondition = () => (entry: api.PageEntry) =>
			!excludedTemplates.includes(entry.template) && filterChannelSelection(entry);

		return (entries || []).filter(filterCondition()).map((entry, index) => {
			return renderEntry(entry, index);
		});
	}

	render() {
		const { title } = this.props;
		return (
			<div className={bem.b()}>
				{this.renderHeaderEntry()}
				<h1 className={bem.e('title')}>{title}</h1>
				{this.renderChannelFilter()}
				{this.renderRailEntries()}
			</div>
		);
	}
}

export default configPage(LiveChannels, {
	template,
	entryRenderers
});
