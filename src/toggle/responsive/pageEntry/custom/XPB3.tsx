import * as React from 'react';
import { XPB3 as template } from 'shared/page/pageEntryTemplate';
import Pb3Background from 'ref/responsive/pageEntry/poster/Pb3Background';

export default function XPB3(props: PageEntryListProps) {
	return <Pb3Background {...props} />;
}

XPB3.template = template;
