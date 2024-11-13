import * as React from 'react';
import BrandedText from 'ref/responsive/pageEntry/branded/BrandedText';
import { squareColumns, textOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Sb2Text as template } from 'shared/page/pageEntryTemplate';

export default function Sb2Text(props: PageEntryListProps) {
	return (
		<BrandedText className={'sb2'} imageType={'square'} columns={squareColumns} offsets={textOffsets} {...props} />
	);
}

Sb2Text.template = template;
