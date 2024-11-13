import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './PackshotTitle.scss';

interface PackshotTitleProps {
	title: string;
	position?: AssetTitlePosition;
	className?: string;
	secondaryLanguageTitle: string;
}

const bem = new Bem('packshot-title');

export default class PackshotTitle extends React.Component<PackshotTitleProps, any> {
	static defaultProps = {
		position: 'none'
	};
	render() {
		const { title, position, className, secondaryLanguageTitle } = this.props;
		if (!title || !position || position === 'none') return false;

		const isOverlayPosition = position === 'overlay';
		const packshotTitleClasses = ['truncate', className];

		return (
			<div className={cx({ 'overlay-container': isOverlayPosition })}>
				<div className={cx(bem.b(position), packshotTitleClasses)}>{title}</div>
				{secondaryLanguageTitle && (
					<div className={cx(bem.b(position, 'secondary'), packshotTitleClasses)}>{secondaryLanguageTitle}</div>
				)}
			</div>
		);
	}
}
