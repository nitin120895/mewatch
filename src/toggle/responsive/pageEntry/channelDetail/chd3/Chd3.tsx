import * as React from 'react';
import { CHD3 as template } from 'shared/page/pageEntryTemplate';
import CHD2 from '../chd2/Chd2';

export default function CHD3(props: PageEntryItemProps) {
	return <CHD2 {...props} />;
}

CHD3.template = template;
