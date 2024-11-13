import * as React from 'react';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import * as cx from 'classnames';

const columns = [{ phone: 8 }, { phablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];

export default class Tl1Standard extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	saveScrollState = scrollX => (this.props.savedState.scrollX = scrollX);

	render() {
		const { list, customFields, savedState, className, loadNextListPage } = this.props;
		const classes = cx('tl1', className);
		return (
			<div className={classes}>
				<EntryTitle {...this.props} />
				<PackshotList
					list={list}
					imageType={'tall'}
					packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
					savedState={savedState}
					columns={columns}
					loadNextListPage={loadNextListPage}
				/>
			</div>
		);
	}
}
