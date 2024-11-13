import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { CH2 as template } from 'shared/page/pageEntryTemplate';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import Ch2ChannelSchedule from './Ch2ChannelSchedule';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { EPG } from 'shared/page/pageTemplate';

import './Ch2.scss';

export const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface Ch2Props extends PageEntryItemProps {
	config?: state.Config;
}

class Ch2 extends React.Component<Ch2Props, any> {
	render() {
		const { item, template, savedState, customFields, className, config } = this.props;
		const classes = cx(template.toLowerCase(), className);
		const path = getPathByKey(EPG, config);
		return (
			<div className={classes}>
				<EntryTitle {...this.props} mainUrl={path} />
				<Ch2ChannelSchedule item={item} savedState={savedState} customFields={customFields} />
			</div>
		);
	}
}

function mapStateToProps(state: state.Root) {
	return {
		config: state.app.config
	};
}

const Component: any = connect<any, any, Ch2Props>(mapStateToProps)(Ch2);
Component.template = template;
export default Component;
