import * as React from 'react';
import B1Standard from 'ref/responsive/pageEntry/block/B1Standard';
import { U3Block as template } from 'shared/page/pageEntryTemplate';

export default function U3Block(props: PageEntryListProps) {
	const { list } = props;
	// Ensure the user list has content before bothering to render anything.
	if (list && list.items && list.items.length < 1) {
		/* tslint:disable-next-line:no-null-keyword */
		return null;
	}
	return <B1Standard {...props} />;
}

U3Block.template = template;
