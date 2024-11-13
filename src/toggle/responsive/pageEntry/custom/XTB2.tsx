import * as React from 'react';
import Tb2Text from 'ref/responsive/pageEntry/tile/Tb2Text';
import { XTB2 as template } from 'shared/page/pageEntryTemplate';

export default function XTB2(props: PageEntryListProps) {
	return <Tb2Text {...props} />;
}

XTB2.template = template;
