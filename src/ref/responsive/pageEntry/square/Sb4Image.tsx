import * as React from 'react';
import BrandedImage from 'ref/responsive/pageEntry/branded/BrandedImage';
import { squareColumns, squareOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Sb4Image as template } from 'shared/page/pageEntryTemplate';

export default function Sb4Image(props: PageEntryListProps) {
	return (
		<BrandedImage className={'sb4'} imageType={'square'} columns={squareColumns} offsets={squareOffsets} {...props} />
	);
}

Sb4Image.template = template;
