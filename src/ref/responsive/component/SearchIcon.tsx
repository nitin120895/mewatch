import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import * as cx from 'classnames';

import './SearchIcon.scss';

interface SearchIconProps extends React.Props<any> {
	className?: string;
}

export default class SearchIcon extends React.PureComponent<SearchIconProps, any> {
	static SVG_DATA = 'm12,12m-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0zm18,7l10,10';
	static VIEW_BOX = { width: 32, height: 32 };

	render() {
		const classes = cx('search-icon', this.props.className, 'svg-icon');
		return (
			<SVGPathIcon
				className={classes}
				data={SearchIcon.SVG_DATA}
				viewBox={SearchIcon.VIEW_BOX}
				fill="none"
				stroke="currentColor"
			/>
		);
	}
}
