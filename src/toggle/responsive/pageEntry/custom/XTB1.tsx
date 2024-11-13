import * as React from 'react';
import { XTB1 as template } from 'shared/page/pageEntryTemplate';
import Tb1Cover from '../tile/Tb1Cover';

export default function XTB1(props: PageEntryListProps) {
	return <Tb1Cover {...props} />;
}

XTB1.template = template;
