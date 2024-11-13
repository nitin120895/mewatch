import * as React from 'react';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';
import { ResultsExtras as template } from 'shared/page/pageEntryTemplate';

export default function ResultsExtras(props: PageEntryListProps) {
	return <T1Standard {...props} />;
}

ResultsExtras.template = template;
