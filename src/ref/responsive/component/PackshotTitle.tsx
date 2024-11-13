import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './PackshotTitle.scss';

interface PackshotTitleProps {
	title: string;
	position?: AssetTitlePosition;
	className?: string;
}

const bem = new Bem('packshot-title');

export default class PackshotTitle extends React.Component<PackshotTitleProps, any> {
	static defaultProps = {
		position: 'none'
	};
	render() {
		const { title, position, className } = this.props;
		if (!title || !position || position === 'none') return false;
		return <span className={cx(bem.b(position), 'truncate', className)}>{title}</span>;
	}
}
