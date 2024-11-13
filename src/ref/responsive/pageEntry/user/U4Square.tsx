import * as React from 'react';
import S1Standard from 'ref/responsive/pageEntry/square/S1Standard';
import { U4Square as template } from 'shared/page/pageEntryTemplate';

export default function U4Square(props: PageEntryListProps) {
	const { list } = props;
	// Ensure the user list has content before bothering to render anything.
	if (list && list.items && list.items.length < 1) {
		/* tslint:disable-next-line:no-null-keyword */
		return null;
	}
	return <S1Standard {...props} />;
}

U4Square.template = template;
