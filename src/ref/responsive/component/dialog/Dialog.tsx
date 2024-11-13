import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CloseCross from 'ref/responsive/component/CloseCross';
import * as cx from 'classnames';

import './Dialog.scss';

interface DialogProps extends React.Props<any> {
	className?: string;
	onClose?: () => void;
}

const bem = new Bem('dialog');

export default function Dialog(props: DialogProps) {
	const { className, children, onClose } = props;
	return (
		<div className={cx(bem.b(), className)}>
			{onClose && <CloseCross className={bem.e('close-btn')} onClick={onClose} height={12} width={12} />}
			{children}
		</div>
	);
}
