import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

interface AppleIconProps {
	className?: string;
	width?: number;
	height?: number;
}

const SVG_DATA =
	'M15.07 11.433c-.023-2.721 2.223-4.027 2.325-4.091-1.264-1.85-3.232-2.103-3.934-2.133-1.674-.17-3.267.985-4.116.985-.848 0-2.16-.96-3.548-.934-1.827.027-3.508 1.061-4.449 2.696-1.896 3.289-.484 8.163 1.362 10.833.904 1.305 1.98 2.776 3.395 2.721 1.363-.054 1.878-.88 3.523-.88 1.646 0 2.11.88 3.55.855 1.465-.029 2.394-1.334 3.292-2.643 1.035-1.515 1.463-2.981 1.488-3.059-.033-.013-2.857-1.096-2.887-4.35M12.365 3.443c.75-.91 1.257-2.174 1.118-3.434-1.082.043-2.391.72-3.168 1.63-.695.804-1.305 2.091-1.14 3.326 1.207.093 2.439-.614 3.19-1.522';

const bem = new Bem('apple-icon');

export default ({ className, width, height }: AppleIconProps) => (
	<SVGPathIcon
		className={cx(bem.b(), className)}
		data={SVG_DATA}
		width={width}
		height={height}
		viewBox={{ width: 22, height: 22 }}
	/>
);
