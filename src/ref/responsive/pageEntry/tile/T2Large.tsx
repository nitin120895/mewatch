import * as React from 'react';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import * as cx from 'classnames';
import { T2Large as template } from 'shared/page/pageEntryTemplate';

export const columns = [{ phone: 24 }, { phablet: 12 }, { laptop: 8 }, { desktopWide: 6 }];

export default function T2Large(props: PageEntryListProps) {
	const { list, customFields, className, savedState, loadNextListPage } = props;
	const classes = cx('t2', className);
	return (
		<div className={classes}>
			<EntryTitle {...props} />
			<PackshotList
				list={list}
				savedState={savedState}
				imageType={'tile'}
				packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
				columns={columns}
				loadNextListPage={loadNextListPage}
			/>
		</div>
	);
}

T2Large.template = template;
