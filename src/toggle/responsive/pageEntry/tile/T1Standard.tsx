import * as React from 'react';
import * as cx from 'classnames';

import { isContinueWatching } from 'shared/list/listUtil';

import CWList from 'toggle/responsive/component/continueWatching/CWList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import PackshotList from 'ref/responsive/component/PackshotList';

export const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface T1StandardProps extends PageEntryListProps {
	// When true converts to T3
	doubleRow?: boolean;
	children?: React.ReactNode;
	// 'tile' is used by default, but in some cases we may want to augment it with fallback values.
	imageTypes?: image.Type[];
}

export default class T1Standard extends React.Component<T1StandardProps> {
	render() {
		const {
			template,
			list,
			children,
			customFields,
			savedState,
			className,
			doubleRow,
			loadNextListPage,
			id
		} = this.props;
		const classes = cx(template.toLowerCase(), className);
		let { imageTypes } = this.props;

		const isCWList = isContinueWatching(list);
		if (imageTypes && !~imageTypes.indexOf('tile')) {
			imageTypes = ['tile', ...imageTypes];
		}

		return (
			<div className={classes}>
				{isCWList ? (
					<CWList
						list={list}
						imageType={imageTypes || 'tile'}
						columns={columns}
						loadNextListPage={loadNextListPage}
						entryTitleProps={{ ...this.props }}
					>
						{children}
					</CWList>
				) : (
					<div>
						<EntryTitle {...this.props} />
						<PackshotList
							id={id}
							list={list}
							imageType={imageTypes || 'tile'}
							packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
							savedState={savedState}
							columns={columns}
							doubleRow={doubleRow}
							loadNextListPage={loadNextListPage}
							template={template}
						>
							{children}
						</PackshotList>
					</div>
				)}
			</div>
		);
	}
}
