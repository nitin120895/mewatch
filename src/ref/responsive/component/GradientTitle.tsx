import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './GradientTitle.scss';

interface GradientTitleProps {
	title: string;
	className?: string;
}

export default function GradientTitle({ title, className }: GradientTitleProps) {
	const bem = new Bem('gradient-title');
	const classes = cx(bem.b(), className);
	const titleClasses = cx(bem.e('title'), 'truncate');
	return (
		<span className={classes}>
			<span className={bem.e('gradient')} />
			<span className={titleClasses}>{title}</span>
		</span>
	);
}
