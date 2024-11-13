import * as React from 'react';
import { SX5 as template } from 'shared/page/pageEntryTemplate';
import FavouriteTeams from 'toggle/responsive/component/FavouriteTeams';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import * as cx from 'classnames';

const columns = [{ phone: 8 }, { phablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];

export default function SX5(props: PageEntryListProps) {
	const { template, list, customFields, savedState, className, loadNextListPage } = props;
	const classes = cx(template.toLowerCase(), className);

	return (
		<div className={classes}>
			<EntryTitle {...props} />
			<FavouriteTeams
				list={list}
				imageType={'square'}
				packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
				savedState={savedState}
				columns={columns}
				loadNextListPage={loadNextListPage}
			/>
		</div>
	);
}

SX5.template = template;
