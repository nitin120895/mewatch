import * as React from 'react';
import sass from 'ref/tv/util/sass';
import UserList, { UserListProps } from './UserList';
import { U2Tile as template } from 'shared/page/pageEntryTemplate';

export default function U2Tile(props: UserListProps) {
	return (
		<UserList
			{...props}
			imageType={['tile', 'wallpaper']}
			imageWidth={sass.tileImageWidth}
			rowType={'t1'}
			rowHeight={sass.u2TileHeight}
		/>
	);
}

U2Tile.template = template;
