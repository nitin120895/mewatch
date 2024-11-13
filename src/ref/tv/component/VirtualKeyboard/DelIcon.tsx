import * as React from 'react';
import * as cx from 'classnames';

import './DelIcon.scss';

interface DelIconProps extends React.Props<any> {
	className?: string;
}

export default class DelIcon extends React.Component<DelIconProps, any> {
	render() {
		const classes = cx('kb-del-icon', this.props.className);
		return (
			<div className={classes}>
				<i className={cx('icon icon-del-icon', classes)} />
				<span>X</span>
			</div>
		);
	}
}
