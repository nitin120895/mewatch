import * as React from 'react';
import BrandedBackground from 'ref/responsive/pageEntry/branded/BrandedBackground';
import { tileColumns, tileOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Tb3Background as template } from 'shared/page/pageEntryTemplate';

export default function Tb3Background(props: PageEntryListProps) {
	return (
		<BrandedBackground
			className={'tb3'}
			imageType={'tile'}
			doubleRow={true}
			columns={tileColumns}
			offsets={tileOffsets}
			{...props}
		/>
	);
}

Tb3Background.template = template;
