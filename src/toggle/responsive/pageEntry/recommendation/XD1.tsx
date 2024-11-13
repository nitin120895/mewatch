import * as React from 'react';
import { XD1 as template } from 'shared/page/pageEntryTemplate';
import { CustomAssetType } from 'toggle/responsive/pageEntry/itemDetail/util/itemProps';
import XDCustom from './XDCustom';

export default function XD1(props: PageEntryItemDetailProps) {
	return <XDCustom {...props} assetType={CustomAssetType.Extras} />;
}

XD1.template = template;
