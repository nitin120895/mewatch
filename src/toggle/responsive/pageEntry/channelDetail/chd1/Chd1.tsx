import * as React from 'react';
import { CHD1 as template } from 'shared/page/pageEntryTemplate';
import XCHD1 from '../xchd1/Xchd1';

export default function CHD1(props: PageEntryItemProps) {
	return <XCHD1 {...props} />;
}

CHD1.template = template;
