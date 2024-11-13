import * as React from 'react';
import BrandedBackground from 'ref/responsive/pageEntry/branded/BrandedBackground';
import { posterColumns, posterOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Pb3Background as template } from 'shared/page/pageEntryTemplate';

export default function Pb3Background(props: PageEntryListProps) {
	return (
		<BrandedBackground
			className={'pb3'}
			imageType={'poster'}
			columns={posterColumns}
			offsets={posterOffsets}
			{...props}
		/>
	);
}

Pb3Background.template = template;
