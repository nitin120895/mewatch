import * as React from 'react';
import * as cx from 'classnames';

import './Spinner.scss';

interface SpinnerProps extends React.Props<any> {
	className?: string;
	type?: 'player' | 'common';
}

export default class Spinner extends React.Component<SpinnerProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		const { className, type } = this.props;

		return <div width="100%" height="100%" className={cx('icon-spinner', className, type)} />;
	}
}
