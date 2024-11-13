import * as React from 'react';
import { SR2 as template } from 'shared/page/pageEntryTemplate';
import T1Standard from 'toggle/responsive/pageEntry/tile/T1Standard';

export default function SR2(props: PageEntryListProps) {
	return <T1Standard {...props} />;
}

SR2.template = template;
