import * as React from 'react';
import { XEPG6 as template } from 'shared/page/pageEntryTemplate';
import CHD2 from 'toggle/responsive/pageEntry/channelDetail/chd2/Chd2';

export default function XEPG6(props: PageEntryItemProps) {
	return <CHD2 {...props} />;
}

XEPG6.template = template;
