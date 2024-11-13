import * as React from 'react';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import * as cx from 'classnames';

const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface S2LargeProps extends PageEntryListProps {
	children?: React.ReactNode;
}

export default class S2Large extends React.Component<S2LargeProps, any> {
	render() {
		const { template, list, children, customFields, savedState, className, loadNextListPage } = this.props;
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
					loadNextListPage={loadNextListPage}
				>
					{children}
				</PackshotList>
			</div>
		);
	}
}
