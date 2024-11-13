import * as React from 'react';
import { XT1 as template } from 'shared/page/pageEntryTemplate';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';

export default function XT1(props: PageEntryListProps) {
	return <T1Standard {...props} />;
}

XT1.template = template;
