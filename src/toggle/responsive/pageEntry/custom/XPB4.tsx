import * as React from 'react';
import { XPB4 as template } from 'shared/page/pageEntryTemplate';
import Pb4Image from 'ref/responsive/pageEntry/poster/Pb4Image';

export default function XPB4(props: PageEntryListProps) {
	return <Pb4Image {...props} />;
}

XPB4.template = template;
