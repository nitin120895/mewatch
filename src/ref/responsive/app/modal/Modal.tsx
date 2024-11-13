import * as React from 'react';
import ModalTypes from 'shared/uiLayer/modalTypes';
import ConfirmationDialog from 'ref/responsive/component/dialog/ConfirmationDialog';
import Dialog from 'ref/responsive/component/dialog/Dialog';
import PasswordDialog from 'ref/responsive/component/dialog/PasswordDialog';
import PinDialog from 'ref/responsive/component/dialog/PinDialog';
import ErrorDialog from 'ref/responsive/component/dialog/ErrorDialog';

interface ModalProps extends React.Props<any> {
	modal: ModalConfig;
	onClose?: (id: string | number) => void;
}

class Modal extends React.PureComponent<ModalProps, any> {
	private onClose = () => {
		const { onClose, modal } = this.props;
		if (onClose) onClose(modal.id);
	};

	render() {
		const { modal } = this.props;

		const commonProps = {
			onClose: this.onClose,
			...modal.componentProps
		} as any;

		switch (modal.type) {
			case ModalTypes.CONFIRMATION_DIALOG:
				return <ConfirmationDialog {...commonProps} />;
			case ModalTypes.STANDARD_DIALOG:
				return <Dialog {...commonProps} />;
			case ModalTypes.CUSTOM:
				return React.cloneElement(modal.element, {
					...commonProps,
					...modal.element.props
				});
			case ModalTypes.PASSWORD_AUTH:
				return <PasswordDialog {...commonProps} />;
			case ModalTypes.PIN_AUTH:
				return <PinDialog {...commonProps} />;
			case ModalTypes.SYSTEM_ERROR:
				return <ErrorDialog {...commonProps} />;
			default:
				return undefined;
		}
	}
}

export default Modal;
