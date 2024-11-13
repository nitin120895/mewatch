import * as React from 'react';
import * as cx from 'classnames';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import PackshotList from 'ref/responsive/component/PackshotList';

export const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

export default class P2Large extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		const { list, customFields, savedState, className, loadNextListPage } = this.props;
		const classes = cx('p2', className);
		return (
			<div className={classes}>
				<EntryTitle {...this.props} />
				<PackshotList
					list={list}
					imageType={'poster'}
					savedState={savedState}
					packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
					columns={columns}
					loadNextListPage={loadNextListPage}
				/>
			</div>
		);
	}
}
