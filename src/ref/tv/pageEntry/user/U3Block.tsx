import * as React from 'react';
import sass from 'ref/tv/util/sass';
import UserList, { UserListProps } from './UserList';
import { U3Block as template } from 'shared/page/pageEntryTemplate';

export default function U3Block(props: UserListProps) {
	return (
		<UserList
			{...props}
			imageType={'block'}
			imageWidth={sass.tileImageWidth}
			rowType={'b1'}
			rowHeight={sass.u3BlockHeight}
		/>
	);
}

U3Block.template = template;
