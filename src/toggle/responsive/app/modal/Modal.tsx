import * as React from 'react';
import { get } from 'shared/util/objects';
import ModalTypes from 'shared/uiLayer/modalTypes';
import Dialog from 'ref/responsive/component/dialog/Dialog';
import PinDialog from 'ref/responsive/component/dialog/PinDialog';
import ErrorDialog from 'ref/responsive/component/dialog/ErrorDialog';
import ConfirmationDialog from 'toggle/responsive/component/dialog/ConfirmationDialog';
import OTPModal from 'toggle/responsive/component/dialog/OTPModal';
import AlertModal from 'toggle/responsive/component/dialog/AlertModal';
import PasswordDialog from 'ref/responsive/component/dialog/PasswordDialog';
import CreatePinOverlay from 'toggle/responsive/pageEntry/account/a1/pin/CreatePinOverlay';
import MePassDialog from 'toggle/responsive/component/dialog/MePassDialog';

interface ModalProps extends React.Props<any> {
	modal: ModalConfig;
	container?: HTMLElement;
	onClose?: (id: string | number) => void;
}

class Modal extends React.PureComponent<ModalProps, any> {
	private onClose = () => {
		const { onClose, modal } = this.props;
		if (onClose) onClose(modal.id);
	};

	render() {
		const { modal, container } = this.props;

		const commonProps = {
			onClose: this.onClose,
			container,
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
				const scope = get(commonProps, 'scopes.0');
				if (scope === 'Commerce') {
					return <PasswordDialog {...commonProps} />;
				}
				return <OTPModal {...commonProps} />;
			case ModalTypes.PIN_AUTH:
				return <PinDialog {...commonProps} />;
			case ModalTypes.PIN_CREATE:
				return <CreatePinOverlay {...commonProps} />;
			case ModalTypes.SYSTEM_ERROR:
				return <ErrorDialog {...commonProps} />;
			case ModalTypes.ALERT_DIALOG:
				return <AlertModal {...commonProps} />;
			case ModalTypes.MEPASS_DIALOG:
				return <MePassDialog {...commonProps} />;
			default:
				return undefined;
		}
	}
}

export default Modal;
