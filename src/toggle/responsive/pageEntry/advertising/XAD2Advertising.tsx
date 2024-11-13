import * as React from 'react';
import { XAD2Advertising as template } from 'shared/page/pageEntryTemplate';
import XAD1Advertising from 'toggle/responsive/pageEntry/advertising/XAD1Advertising';

export default function XAD2Advertising(props: PageEntryPropsBase) {
	return <XAD1Advertising {...props} />;
}

XAD2Advertising.template = template;
