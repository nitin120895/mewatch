import * as React from 'react';
import AssetList, { AssetListProps } from './AssetList';
import EntryTitle from './EntryTitle';

export default function EntryList(props: AssetListProps) {
	return (
		<section>
			<EntryTitle {...props} />
			<AssetList {...props} />
		</section>
	);
}
