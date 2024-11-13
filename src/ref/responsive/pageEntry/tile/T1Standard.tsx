import * as React from 'react';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import * as cx from 'classnames';

export const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface T1StandardProps extends PageEntryListProps {
	// When true converts to T3
	doubleRow?: boolean;
	children?: React.ReactNode;
	// 'tile' is used by default, but in some cases we may want to augment it with fallback values.
	imageTypes?: image.Type[];
}

export default class T1Standard extends React.Component<T1StandardProps, any> {
	render() {
		const { template, list, children, customFields, savedState, className, doubleRow, loadNextListPage } = this.props;
		const classes = cx(template.toLowerCase(), className);
		let { imageTypes } = this.props;
		if (imageTypes && !~imageTypes.indexOf('tile')) {
			imageTypes = ['tile', ...imageTypes];
		}
		return (
			<div className={classes}>
				<EntryTitle {...this.props} />
				<PackshotList
					list={list}
					imageType={imageTypes || 'tile'}
					packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
					savedState={savedState}
					columns={columns}
					doubleRow={doubleRow}
					loadNextListPage={loadNextListPage}
				>
					{children}
				</PackshotList>
			</div>
		);
	}
}
