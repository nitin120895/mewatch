import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './DialogTitle.scss';

interface DialogTitleProps extends React.Props<any> {
	className?: string;
}

const bem = new Bem('dialog-title');

export default function Dialog(props: DialogTitleProps) {
	const { className, children, ...otherProps } = props;
	return (
		<IntlFormatter elementType="div" {...otherProps} className={cx(className, bem.b())}>
			{children}
		</IntlFormatter>
	);
}
