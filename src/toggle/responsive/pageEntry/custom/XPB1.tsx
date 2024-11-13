import * as React from 'react';
import { XPB1 as template } from 'shared/page/pageEntryTemplate';
import Pb1Cover from '../poster/Pb1Cover';

export default function XPB1(props: PageEntryListProps) {
	return <Pb1Cover {...props} />;
}

XPB1.template = template;
