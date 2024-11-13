import * as React from 'react';
import Packshot from 'ref/responsive/component/Packshot';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import { calculateMedianWidth, getColumnClasses } from 'ref/responsive/util/grid';
import * as cx from 'classnames';

import './Pb1Cover.scss';

// A 4:3 hero doesn't mathematically align with a poster row.
// So we set columns to approximately match the height of the adjacent content,
// which are then adjusted via CSS to align properly.
const heroColumns = [{ phone: 16 }, { phablet: 12 }, { laptop: 8 }, { desktopWide: 6 }];

const heroImageWidth = calculateMedianWidth(heroColumns);

export default class Pb1Cover extends React.Component<PageEntryListProps, any> {
	render() {
		const { list, customFields } = this.props;
		// Convert a list into an item for rendering convenience
		const listItem: api.ItemSummary = {
			id: list.id,
			title: list.title,
			path: (customFields || {}).moreLinkUrl || list.path,
			type: 'link',
			images: list.images
		};
		const imageOptions: image.Options = { width: heroImageWidth };
		return (
			<P1Standard {...this.props} template="PB1">
				<Packshot
					imageType={'hero4x3'}
					item={listItem}
					imageOptions={imageOptions}
					className={cx('packshot-list__packshot', 'pb1__hero', ...getColumnClasses(heroColumns))}
				/>
			</P1Standard>
		);
	}
}
