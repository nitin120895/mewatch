import * as React from 'react';
import Tb4Image from 'ref/responsive/pageEntry/tile/Tb4Image';
import { XTB4 as template } from 'shared/page/pageEntryTemplate';

export default function XTB4(props: PageEntryListProps) {
	return <Tb4Image {...props} />;
}

XTB4.template = template;
