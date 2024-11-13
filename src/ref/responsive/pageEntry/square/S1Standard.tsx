import * as React from 'react';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import * as cx from 'classnames';

const columns = [{ phone: 8 }, { phablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];

interface S1StandardProps extends PageEntryListProps {
	// When true converts to S3
	doubleRow?: boolean;
}

export default class S1Standard extends React.Component<S1StandardProps, any> {
	render() {
		const { template, list, customFields, savedState, className, doubleRow, loadNextListPage } = this.props;
		const classes = cx(template.toLowerCase(), className);
		return (
			<div className={classes}>
				<EntryTitle {...this.props} />
				<PackshotList
					list={list}
					imageType={'square'}
					packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
					savedState={savedState}
					columns={columns}
					doubleRow={doubleRow}
					loadNextListPage={loadNextListPage}
				/>
			</div>
		);
	}
}
