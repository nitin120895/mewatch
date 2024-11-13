import * as React from 'react';
import T1Standard from '../tile/T1Standard';
import { ResultsTv as template } from 'shared/page/pageEntryTemplate';

export default function ResultsTv(props: PageEntryListProps) {
	return <T1Standard {...props} />;
}

ResultsTv.template = template;
