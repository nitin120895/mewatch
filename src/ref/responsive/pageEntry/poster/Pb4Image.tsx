import * as React from 'react';
import BrandedImage from 'ref/responsive/pageEntry/branded/BrandedImage';
import { posterColumns, posterOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Pb4Image as template } from 'shared/page/pageEntryTemplate';

export default function Pb4Image(props: PageEntryListProps) {
	return (
		<BrandedImage className={'pb4'} imageType={'poster'} columns={posterColumns} offsets={posterOffsets} {...props} />
	);
}

Pb4Image.template = template;
