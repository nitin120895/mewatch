import * as React from 'react';
import Sb2Text from 'ref/responsive/pageEntry/square/Sb2Text';
import { XSB2 as template } from 'shared/page/pageEntryTemplate';

export default function XSB2(props: PageEntryListProps) {
	return <Sb2Text {...props} />;
}

XSB2.template = template;
