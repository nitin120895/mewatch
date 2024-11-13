import * as React from 'react';
import BrandedText from 'ref/responsive/pageEntry/branded/BrandedText';
import { posterColumns, textOffsets } from 'ref/responsive/pageEntry/branded/columns';
import { Pb2Text as template } from 'shared/page/pageEntryTemplate';

export default function Pb2Text(props: PageEntryListProps) {
	return (
		<BrandedText className={'pb2'} imageType={'poster'} columns={posterColumns} offsets={textOffsets} {...props} />
	);
}

Pb2Text.template = template;
