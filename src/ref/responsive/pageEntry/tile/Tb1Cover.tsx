import * as React from 'react';
import * as cx from 'classnames';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';
import Packshot from 'ref/responsive/component/Packshot';
import { calculateMedianWidth, getColumnClasses } from 'ref/responsive/util/grid';

import './Tb1Cover.scss';

// A 4:3 hero doesn't mathematically align with double 16:9 rows.
// So we set columns to approximately match the height of the adjacent content,
// which are then adjusted via CSS to align properly.
const heroColumns = [{ phone: 19 }, { phablet: 13 }, { laptop: 10 }, { desktopWide: 7 }];

const heroImageWidth = calculateMedianWidth(heroColumns);

export default class Tb1Cover extends React.Component<PageEntryListProps, any> {
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
			<T1Standard {...this.props} template="TB1" doubleRow={true}>
				<Packshot
					imageType={'hero4x3'}
					item={listItem}
					imageOptions={imageOptions}
					className={cx('packshot-list__packshot', 'tb1__hero', ...getColumnClasses(heroColumns))}
				/>
			</T1Standard>
		);
	}
}
