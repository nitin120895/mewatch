import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';
import { S3Double as template } from 'shared/page/pageEntryTemplate';

export default function S3Double(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.posterImageWidth}
			rowType={'s3'}
			isDouble={true}
			rowHeight={sass.s3DoubleHeight}
		/>
	);
}

S3Double.template = template;
