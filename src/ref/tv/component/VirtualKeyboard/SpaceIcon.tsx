import * as React from 'react';
import * as cx from 'classnames';

import './SpaceIcon.scss';

interface SpaceIconProps extends React.Props<any> {
	className?: string;
}

export default class SpaceIcon extends React.Component<SpaceIconProps, any> {
	render() {
		const classes = cx('kb-space-icon', this.props.className);
		return (
			<div className={classes}>
				<i className={cx('icon icon-space-icon', classes)} />
			</div>
		);
	}
}
