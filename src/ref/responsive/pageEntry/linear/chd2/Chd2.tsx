import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { CHD2 as template } from 'shared/page/pageEntryTemplate';
import { isOnNow } from '../common/utils';
import { selectActivePageId } from 'shared/page/pageUtil';
import { Ch2ItemProps } from '../ch2/Ch2Item';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import Ch2ChannelSchedule from '../ch2/Ch2ChannelSchedule';
import SmoothScrolling from 'shared/util/smoothScrolling';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { EPG } from 'shared/page/pageTemplate';

import './Chd2.scss';

export const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface Chd2Props extends PageEntryItemProps {
	activePageId?: string;
	config?: state.Config;
}

class Chd2 extends React.PureComponent<Chd2Props> {
	componentWillUnmount() {
		SmoothScrolling.stop();
	}

	private onItemClick = (e: React.SyntheticEvent<any>, item: Ch2ItemProps['item']) => {
		if (isOnNow(item.schedule)) {
			e.preventDefault();
			SmoothScrolling.scrollTo('root');
		}
	};

	render() {
		const { item, template, savedState, customFields, activePageId, className, config } = this.props;
		const classes = cx(template.toLowerCase(), className);

		const path = getPathByKey(EPG, config);
		return (
			<div className={classes}>
				<EntryTitle {...this.props} mainUrl={path} />
				{activePageId && (
					<Ch2ChannelSchedule
						item={{ ...item, id: activePageId }}
						savedState={savedState}
						customFields={customFields}
						onItemClick={this.onItemClick}
					/>
				)}
			</div>
		);
	}
}

function mapStateToProps(state: state.Root) {
	return {
		activePageId: selectActivePageId(state),
		config: state.app.config
	};
}

const Component: any = connect<any, any, Chd2Props>(mapStateToProps)(Chd2);
Component.template = template;

export default Component;
