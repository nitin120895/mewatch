import * as React from 'react';
import * as cx from 'classnames';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import { UX1Recommendation as template } from 'shared/page/pageEntryTemplate';

export const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

export default function UX1Recommendation(props: PageEntryListProps) {
	const { list, className, savedState, loadNextListPage, customFields } = props;
	const packshotTitlePosition = customFields && customFields.assetTitlePosition;
	const shouldRenderRow = list && list.items.length > 0;

	const classes = cx('recommendation-rail', className);

	return (
		shouldRenderRow && (
			<div className={classes}>
				<EntryTitle {...props} />
				<PackshotList
					list={list}
					savedState={savedState}
					imageType={'tile'}
					packshotTitlePosition={packshotTitlePosition}
					columns={columns}
					loadNextListPage={loadNextListPage}
				/>
			</div>
		)
	);
}

UX1Recommendation.template = template;
