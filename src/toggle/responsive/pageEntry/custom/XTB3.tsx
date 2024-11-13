import * as React from 'react';
import Tb3Background from 'ref/responsive/pageEntry/tile/Tb3Background';
import { XTB3 as template } from 'shared/page/pageEntryTemplate';

export default function XTB3(props: PageEntryListProps) {
	return <Tb3Background {...props} />;
}

XTB3.template = template;
