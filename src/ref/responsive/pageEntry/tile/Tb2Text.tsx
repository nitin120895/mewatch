import * as React from 'react';
import BrandedText from 'ref/responsive/pageEntry/branded/BrandedText';
import { tileColumns, textOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Tb2Text as template } from 'shared/page/pageEntryTemplate';

export default function Tb2Text(props: PageEntryListProps) {
	return (
		<BrandedText
			className={'tb2'}
			imageType={'tile'}
			doubleRow={true}
			columns={tileColumns}
			offsets={textOffsets}
			{...props}
		/>
	);
}

Tb2Text.template = template;
