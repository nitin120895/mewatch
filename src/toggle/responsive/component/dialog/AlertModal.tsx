import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import CtaButton from 'ref/responsive/component/CtaButton';
import Dialog from 'toggle/responsive/component/dialog/Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';

import './AlertModal.scss';

interface Props extends React.Props<any> {
	className?: string;
	title?: string;
	confirmLabel?: string;
	onConfirm?: () => void;
	hideCloseIcon?: boolean;
}

const bem = new Bem('alert-modal');

export default class AlertModal extends React.Component<Props, any> {
	private onConfirm = () => {
		const { onConfirm } = this.props;
		if (onConfirm) onConfirm();
	};

	render() {
		const { className, children, onConfirm, title, confirmLabel, hideCloseIcon } = this.props;

		return (
			<div className={bem.b()}>
				<Dialog hideCloseIcon={hideCloseIcon} className={className}>
					{title && <DialogTitle>{title}</DialogTitle>}
					<IntlFormatter tagName="div" className={bem.e('content')}>
						{children}
					</IntlFormatter>
					<div className={bem.e('button')}>
						{onConfirm && (
							<CtaButton ordinal="primary" theme="light" className={bem.e('primary-btn')} onClick={this.onConfirm}>
								<IntlFormatter>{confirmLabel}</IntlFormatter>
							</CtaButton>
						)}
					</div>
				</Dialog>
			</div>
		);
	}
}
