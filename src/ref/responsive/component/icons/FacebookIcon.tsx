import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './FacebookIcon.scss';

interface FacebookIconProps {
	className?: string;
	width?: number;
	height?: number;
}

const SVG_DATA =
	'M12.91,36.71 L12.91,20.29 L18.43,20.29 L19.25,13.89 L12.91,13.89 L12.91,9.80 C12.91,7.95 13.42,6.69 16.086,6.69 L19.47,6.69 L19.47,0.96 C18.89,0.89 16.88,0.71 14.536,0.71 C9.65,0.71 6.31,3.69 6.30,9.17 L6.31,13.89 L0.78,13.89 L0.78,20.29 L6.31,20.29 L6.31,36.71 L12.91,36.71 Z';

const bem = new Bem('facebook-icon');

export default ({ className, width, height }: FacebookIconProps) => (
	<SVGPathIcon
		className={cx(bem.b(), className)}
		data={SVG_DATA}
		width={width}
		height={height}
		viewBox={{ width: 20, height: 37 }}
	/>
);
