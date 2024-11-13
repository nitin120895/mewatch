import * as React from 'react';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';
import { U2Tile as template } from 'shared/page/pageEntryTemplate';

export default function U2Tile(props: PageEntryListProps) {
	const { list } = props;
	// Ensure the user list has content before bothering to render anything.
	if (list && list.items && list.items.length < 1) {
		/* tslint:disable-next-line:no-null-keyword */
		return null;
	}
	// User lists (e.g. Bookmarks) may contain mixed content types (movies, shows, etc).
	// Not all customer catalogues contain tile images for each item type, so we allow
	// wallpaper images as a fallback for when an operator schedules the U2 page entry.
	return <T1Standard {...props} imageTypes={['tile', 'wallpaper']} />;
}

U2Tile.template = template;
