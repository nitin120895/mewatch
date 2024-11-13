import * as React from 'react';
import Sb3Background from 'ref/responsive/pageEntry/square/Sb3Background';
import { XSB3 as template } from 'shared/page/pageEntryTemplate';

export default function XSB3(props: PageEntryListProps) {
	return <Sb3Background {...props} />;
}

XSB3.template = template;
