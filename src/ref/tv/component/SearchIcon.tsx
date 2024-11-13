import * as React from 'react';
import * as cx from 'classnames';

import './SearchIcon.scss';

interface SearchIconProps extends React.Props<any> {
	className?: string;
}

export default class SearchIcon extends React.Component<SearchIconProps, any> {
	render() {
		const classes = cx('icon icon-search-icon', this.props.className);
		return <i className={classes} />;
	}
}
