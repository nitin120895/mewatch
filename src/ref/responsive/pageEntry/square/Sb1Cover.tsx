import * as React from 'react';
import S2Large from 'ref/responsive/pageEntry/square/S2Large';
import Packshot from 'ref/responsive/component/Packshot';
import { calculateMedianWidth, getColumnClasses } from 'ref/responsive/util/grid';
import * as cx from 'classnames';

import './Sb1Cover.scss';

// A 4:3 hero doesn't mathematically align with a large square row.
// So we set columns to approximately match the height of the adjacent content,
// which are then adjusted via CSS to align properly.
const heroColumns = [{ phone: 16 }, { phablet: 12 }, { laptop: 8 }, { desktopWide: 6 }];

const heroImageWidth = calculateMedianWidth(heroColumns);

export default class Sb1Cover extends React.Component<PageEntryListProps, any> {
	render() {
		const { list } = this.props;
		// Convert a list into an item for rendering convenience
		const listItem: api.ItemSummary = {
			id: list.id,
			title: list.title,
			path: list.path,
			type: 'link',
			images: list.images
		};
		const imageOptions: image.Options = { width: heroImageWidth };
		return (
			<S2Large {...this.props} template="SB1">
				<Packshot
					imageType={'hero4x3'}
					item={listItem}
					imageOptions={imageOptions}
					className={cx('packshot-list__packshot', 'sb1__hero', ...getColumnClasses(heroColumns))}
				/>
			</S2Large>
		);
	}
}
