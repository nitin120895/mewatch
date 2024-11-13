import * as React from 'react';
import sass from 'ref/tv/util/sass';
import UserList, { UserListProps } from './UserList';
import { U4Square as template } from 'shared/page/pageEntryTemplate';

export default function U4Square(props: UserListProps) {
	return (
		<UserList
			{...props}
			imageType={'square'}
			imageWidth={sass.squareImageWidth}
			rowType={'s1'}
			rowHeight={sass.u4SquareHeight}
		/>
	);
}

U4Square.template = template;
