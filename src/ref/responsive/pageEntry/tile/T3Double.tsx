import * as React from 'react';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';
import { T3Double as template } from 'shared/page/pageEntryTemplate';

export default function T3Double(props: PageEntryListProps) {
	return <T1Standard {...props} doubleRow={true} />;
}

T3Double.template = template;
