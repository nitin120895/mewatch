import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './Tooltip.scss';

interface TooltipProps {
	text: string | React.ReactElement<any>;
	className?: string;
}

const bem = new Bem('tooltip');

const Tooltip: React.SFC<TooltipProps> = ({ text, className, children }) => (
	<div className={cx(bem.b(), className)}>
		{children}
		<IntlFormatter className={bem.e('text')}>{text}</IntlFormatter>
	</div>
);

export default Tooltip;
