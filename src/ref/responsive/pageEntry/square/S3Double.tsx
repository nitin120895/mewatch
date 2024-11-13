import * as React from 'react';
import S1Standard from 'ref/responsive/pageEntry/square/S1Standard';
import { S3Double as template } from 'shared/page/pageEntryTemplate';

export default function S3Double(props: PageEntryListProps) {
	return <S1Standard {...props} doubleRow={true} />;
}

S3Double.template = template;
