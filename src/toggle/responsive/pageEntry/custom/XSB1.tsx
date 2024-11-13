import * as React from 'react';
import { XSB1 as template } from 'shared/page/pageEntryTemplate';
import Sb1Cover from '../square/Sb1Cover';

export default function XSB1(props: PageEntryListProps) {
	return <Sb1Cover {...props} />;
}

XSB1.template = template;
