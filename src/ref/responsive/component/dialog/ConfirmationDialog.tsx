import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import CtaButton from 'ref/responsive/component/CtaButton';
import Dialog from './Dialog';
import DialogTitle from './DialogTitle';

import './ConfirmationDialog.scss';

interface ConfirmationDialogProps extends React.Props<any> {
	className?: string;
	title?: string;
	onClose?: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	closeOnConfirm?: boolean;
}

const bem = new Bem('confirmation-dialog');

export default class ConfirmationDialog extends React.Component<ConfirmationDialogProps, any> {
	static defaultProps = {
		confirmLabel: '@{app.confirm|Confirm}',
		cancelLabel: '@{app.cancel|Cancel}',
		closeOnConfirm: true
	};

	private onConfirm = () => {
		const { onClose, closeOnConfirm, onConfirm } = this.props;
		onConfirm();
		if (closeOnConfirm) {
			onClose();
		}
	};

	render() {
		const { className, onClose, children, onConfirm, onCancel, title, confirmLabel, cancelLabel } = this.props;

		return (
			<Dialog onClose={onClose} className={cx(className, bem.b())}>
				{title && <DialogTitle>{title}</DialogTitle>}
				<div className={bem.e('content')}>{children}</div>
				<div className={bem.e('buttons')}>
					{onConfirm && (
						<CtaButton ordinal="primary" theme="light" className={bem.e('primary-btn')} onClick={this.onConfirm}>
							<IntlFormatter>{confirmLabel}</IntlFormatter>
						</CtaButton>
					)}
					{onCancel ||
						(onClose && (
							<IntlFormatter
								elementType={CtaButton}
								componentProps={{
									theme: 'light',
									ordinal: 'naked',
									onClick: onCancel || onClose
								}}
							>
								{cancelLabel}
							</IntlFormatter>
						))}
				</div>
			</Dialog>
		);
	}
}
