import * as React from 'react';
import sass from 'ref/tv/util/sass';
import UserList, { UserListProps } from './UserList';
import { U1Poster as template } from 'shared/page/pageEntryTemplate';

export default function U1Poster(props: UserListProps) {
	return (
		<UserList
			{...props}
			imageType={'poster'}
			imageWidth={sass.posterImageWidth}
			rowType={'p1'}
			rowHeight={sass.u1PosterHeight}
		/>
	);
}

U1Poster.template = template;
