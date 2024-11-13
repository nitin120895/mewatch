import * as React from 'react';
import { configPage } from 'shared/';
import * as templates from 'shared/page/pageTemplate';
import entryRenderers from './channelDetailEntries';
import { XAD1Advertising, XAD2Advertising } from 'shared/page/pageEntryTemplate';
import PageNotFound from 'toggle/responsive/page/PageNotFound';
import { itemEntries } from 'shared/util/itemUtils';
import { isEmptyObject } from 'shared/util/objects';

interface ChannelDetailPageProps extends PageProps {
	cache: any;
}

class ChannelDetail extends React.Component<ChannelDetailPageProps, any> {
	shouldComponentUpdate(props) {
		// Skip rendering if page is not fully loaded
		return !!props.entries;
	}

	render() {
		return <div className="channel-detail">{renderEntries(this.props)}</div>;
	}
}

function renderEntries(props: ChannelDetailPageProps) {
	const { loading, entries, renderEntry, item, cache } = props;
	// if cache item empty then this is page refresh / sign out rather than actual page not found
	const isCacheObjEmpty = isEmptyObject(cache);
	if (!loading && !item && !isCacheObjEmpty) return <PageNotFound {...props} />;
	return (entries || []).map((entry, index) => {
		let entryProps;
		if ([XAD1Advertising, XAD2Advertising].indexOf(entry.template) !== -1) {
			entryProps = { item };
		} else if (entry.type === itemEntries.ItemDetailEntry) {
			entryProps = { channelDetailCache: cache, item };
		}
		return renderEntry(entry, index, entryProps);
	});
}

const mapStateToProps = (state: state.Root) => ({
	cache: state.cache.itemDetail
});

export default configPage(ChannelDetail, {
	template: templates.ChannelDetail,
	entryRenderers,
	mapStateToProps
} as any);
