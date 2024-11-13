import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import CtaButton from 'ref/responsive/component/CtaButton';
import Dialog from './Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';

import './ConfirmationDialog.scss';
import './ConfirmationDialogModals.scss';

export interface ConfirmationDialogProps {
	id?: string;
	className?: string;
	title?: string;
	onClose?: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	closeOnConfirm?: boolean;
	closeOnCancel?: boolean;
	hideCloseIcon?: boolean;
	children?: any;
	target?: ModalConfig['target'];
}

const bem = new Bem('confirmation-dialog');

export default class ConfirmationDialog extends React.PureComponent<ConfirmationDialogProps> {
	static defaultProps = {
		confirmLabel: '@{app.confirm|Confirm}',
		cancelLabel: '@{app.cancel|Cancel}',
		closeOnConfirm: true,
		closeOnCancel: true
	};

	private onConfirm = () => {
		const { onConfirm, closeOnConfirm, onClose } = this.props;
		onConfirm();
		if (closeOnConfirm) {
			onClose();
		}
	};

	private onCancel = () => {
		const { onCancel, onClose, closeOnCancel } = this.props;
		onCancel();
		if (closeOnCancel) {
			onClose();
		}
	};

	render() {
		const {
			className,
			children,
			onConfirm,
			onCancel,
			title,
			confirmLabel,
			cancelLabel,
			hideCloseIcon,
			onClose
		} = this.props;

		return (
			<Dialog onClose={onClose} hideCloseIcon={hideCloseIcon} className={cx(className, bem.b())}>
				{title && <DialogTitle>{title}</DialogTitle>}
				<div className={bem.e('content')}>
					{typeof children === 'string' ? <IntlFormatter>{children}</IntlFormatter> : children}
				</div>
				<div className={bem.e('buttons')}>
					{onConfirm && (
						<CtaButton ordinal="primary" theme="light" className={bem.e('primary-btn')} onClick={this.onConfirm}>
							<IntlFormatter>{confirmLabel}</IntlFormatter>
						</CtaButton>
					)}
					{onCancel && (
						<IntlFormatter
							elementType={CtaButton}
							componentProps={{
								theme: 'dark',
								ordinal: 'secondary',
								onClick: this.onCancel
							}}
						>
							{cancelLabel}
						</IntlFormatter>
					)}
				</div>
			</Dialog>
		);
	}
}
