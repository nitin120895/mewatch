import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CloseIcon from 'toggle/responsive/component/modal/CloseIcon';
import * as cx from 'classnames';

import './Dialog.scss';

interface DialogProps extends React.Props<any> {
	className?: string;
	onClose?: () => void;
	hideCloseIcon?: boolean;
}

const bem = new Bem('dialog');

export default function Dialog(props: DialogProps) {
	const { className, children, onClose, hideCloseIcon } = props;
	return (
		<div className={cx(bem.b(), className)}>
			{!hideCloseIcon && (
				<div className={bem.e('close-btn')} onClick={onClose}>
					<CloseIcon />
				</div>
			)}
			{children}
		</div>
	);
}
