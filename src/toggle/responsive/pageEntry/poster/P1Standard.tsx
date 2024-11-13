import * as React from 'react';
import * as cx from 'classnames';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import PackshotList from 'ref/responsive/component/PackshotList';

export const columns = [{ phone: 8 }, { phablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];

interface P1StandardProps extends PageEntryListProps {
	children?: React.ReactNode;
}

export default class P1Standard extends React.Component<P1StandardProps, any> {
	render() {
		const { template, list, customFields, savedState, className, children, loadNextListPage } = this.props;
		const shouldRenderRow = list && list.items.length > 0;

		const classes = cx(template.toLowerCase(), className);
		return (
			shouldRenderRow && (
				<div className={classes}>
					<EntryTitle {...this.props} />
					<PackshotList
						list={list}
						imageType={'poster'}
						packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
						savedState={savedState}
						columns={columns}
						loadNextListPage={loadNextListPage}
						template={template}
					>
						{children}
					</PackshotList>
				</div>
			)
		);
	}
}
