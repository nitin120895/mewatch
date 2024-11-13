import * as React from 'react';
import B1Standard from 'ref/responsive/pageEntry/block/B1Standard';
import { B3Double as template } from 'shared/page/pageEntryTemplate';

export default function B3Double(props: PageEntryListProps) {
	return <B1Standard {...props} double={true} />;
}

B3Double.template = template;
