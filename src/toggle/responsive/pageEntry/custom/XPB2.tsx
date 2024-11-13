import * as React from 'react';
import { XPB2 as template } from 'shared/page/pageEntryTemplate';
import Pb2Text from 'ref/responsive/pageEntry/poster/Pb2Text';

export default function XPB2(props: PageEntryListProps) {
	return <Pb2Text {...props} />;
}

XPB2.template = template;
