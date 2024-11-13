import * as React from 'react';
import { XD2 as template } from 'shared/page/pageEntryTemplate';
import { CustomAssetType } from 'toggle/responsive/pageEntry/itemDetail/util/itemProps';
import XDCustom from './XDCustom';

export default function XD2(props: PageEntryItemDetailProps) {
	return <XDCustom {...props} assetType={CustomAssetType.Similar} />;
}

XD2.template = template;
