import * as React from 'react';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import { U1Poster as template } from 'shared/page/pageEntryTemplate';

export default function U1Poster(props: PageEntryListProps) {
	const { list } = props;
	// Ensure the user list has content before bothering to render anything.
	if (list && list.items && list.items.length < 1) {
		/* tslint:disable-next-line:no-null-keyword */
		return null;
	}
	return <P1Standard {...props} />;
}

U1Poster.template = template;
