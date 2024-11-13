import * as React from 'react';
import BrandedBackground from 'ref/responsive/pageEntry/branded/BrandedBackground';
import { squareColumns, squareOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Sb3Background as template } from 'shared/page/pageEntryTemplate';

export default function Sb3Background(props: PageEntryListProps) {
	return (
		<BrandedBackground
			className={'sb3'}
			imageType={'square'}
			columns={squareColumns}
			offsets={squareOffsets}
			{...props}
		/>
	);
}

Sb3Background.template = template;
