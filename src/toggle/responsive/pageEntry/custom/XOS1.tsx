import * as React from 'react';
import { XOS1 as template } from 'shared/page/pageEntryTemplate';
import { XUS1 } from 'toggle/responsive/pageEntry/custom/XUS1';

export function XOS1(props: api.PageEntry) {
	return <XUS1 {...props} />;
}

XOS1.template = template;
