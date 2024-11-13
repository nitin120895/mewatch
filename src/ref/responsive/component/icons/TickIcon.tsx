import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './TickIcon.scss';

interface TickIconProps {
	className?: string;
	width?: number;
	height?: number;
}

const bem = new Bem('tick-icon');

export default ({ className, width, height }: TickIconProps) => (
	<SVGPathIcon
		className={cx(bem.b(), className)}
		fill="transparent"
		data={'M4.29 11.582l4.017 4.043L17.872 6.5'}
		width={width}
		height={height}
		viewBox={{ width: width, height: height }}
	/>
);
