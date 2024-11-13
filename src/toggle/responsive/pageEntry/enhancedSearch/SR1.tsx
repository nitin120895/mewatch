import * as React from 'react';
import { SR1 as template } from 'shared/page/pageEntryTemplate';
import P1Standard from 'toggle/responsive/pageEntry/poster/P1Standard';

export default function SR1(props: PageEntryListProps) {
	return <P1Standard {...props} />;
}

SR1.template = template;
