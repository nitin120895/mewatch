import * as React from 'react';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';
import { ResultsSports as template } from 'shared/page/pageEntryTemplate';

export default function ResultsSports(props: PageEntryListProps) {
	return <T1Standard {...props} />;
}

ResultsSports.template = template;
