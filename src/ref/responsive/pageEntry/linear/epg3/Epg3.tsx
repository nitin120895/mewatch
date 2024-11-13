import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import Epg3Item from './Epg3Item';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import PackshotList from 'ref/responsive/component/PackshotList';
import { Epg3 as template } from 'shared/page/pageEntryTemplate';
import { getEPG3RowList } from '../common/utils';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { EPG } from 'shared/page/pageTemplate';

import './Epg3.scss';

const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface Epg3Props extends PageEntryListProps {
	config?: state.Config;
}

class Epg3 extends React.Component<Epg3Props, any> {
	render() {
		const { template, children, customFields, savedState, className, loadNextListPage, list, config } = this.props;
		const classes = cx(template.toLowerCase(), className);
		const epg3List = getEPG3RowList(list);

		// tslint:disable-next-line: no-null-keyword
		if (!list.size) return null;

		const path = getPathByKey(EPG, config);
		return (
			<div className={classes}>
				<EntryTitle {...this.props} mainUrl={path} />
				<PackshotList
					list={epg3List}
					imageType={'tile'}
					packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
					savedState={savedState}
					columns={columns}
					doubleRow={false}
					loadNextListPage={loadNextListPage}
					component={props => <Epg3Item {...props} columns={columns} />}
				>
					{children}
				</PackshotList>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root) {
	return {
		config: state.app.config
	};
}

const Component: any = connect<any, any, Epg3Props>(mapStateToProps)(Epg3);
Component.template = template;
export default Component;
