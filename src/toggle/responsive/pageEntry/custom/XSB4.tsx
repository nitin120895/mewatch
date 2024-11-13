import * as React from 'react';
import Sb4Image from 'ref/responsive/pageEntry/square/Sb4Image';
import { XSB4 as template } from 'shared/page/pageEntryTemplate';

export default function XSB4(props: PageEntryListProps) {
	return <Sb4Image {...props} />;
}

XSB4.template = template;
