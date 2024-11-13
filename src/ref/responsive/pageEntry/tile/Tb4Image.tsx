import * as React from 'react';
import BrandedImage from 'ref/responsive/pageEntry/branded/BrandedImage';
import { tileColumns, tileOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Tb4Image as template } from 'shared/page/pageEntryTemplate';

export default function Tb4Image(props: PageEntryListProps) {
	return (
		<BrandedImage
			className={'tb4'}
			imageType={'tile'}
			doubleRow={true}
			columns={tileColumns}
			offsets={tileOffsets}
			{...props}
		/>
	);
}

Tb4Image.template = template;
