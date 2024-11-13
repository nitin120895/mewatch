import * as React from 'react';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import * as cx from 'classnames';

const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface B1StandardProps extends PageEntryListProps {
	// When true converts to B3
	double?: boolean;
}

export default class B1Standard extends React.Component<B1StandardProps, any> {
	render() {
		const { template, list, customFields, savedState, className, double, loadNextListPage } = this.props;
		const classes = cx(template.toLowerCase(), className);
		return (
			<div className={classes}>
				<EntryTitle {...this.props} />
				<PackshotList
					list={list}
					imageType={'block'}
					packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
					savedState={savedState}
					columns={columns}
					doubleRow={double}
					loadNextListPage={loadNextListPage}
				/>
			</div>
		);
	}
}
