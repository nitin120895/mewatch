import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalManager from 'ref/responsive/app/modal/ModalManager';

import './ModalManagerComponents.scss';

interface ModalManagerComponentsProps {
	onShowModal: (config: ModalConfig) => void;
	onHideModal: (id: any) => void;
}

const bem = new Bem('modal-manager-components');

// A set of example configs for each modal type
const configs: {
	[modalType: string]: (
		idModifier?: string | number,
		closeModal?: (id: string | number) => void,
		disableAutoClose?: boolean
	) => ModalConfig;
} = {
	[ModalTypes.CONFIRMATION_DIALOG]: (idModifier = 'test', closeModal, disableAutoClose) => {
		const id = `${idModifier}-confirm`;
		return {
			id,
			type: ModalTypes.CONFIRMATION_DIALOG,
			disableAutoClose,
			componentProps: {
				title: 'Are you sure?',
				children: 'This is a test dialog, how did it go?',
				confirmLabel: 'Yes',
				cancelLabel: 'No',
				onConfirm: () => closeModal(id),
				onCancel: () => closeModal(id)
			}
		};
	},
	[ModalTypes.STANDARD_DIALOG]: idModifier => {
		const id = `${idModifier}-standard`;
		return {
			id,
			type: ModalTypes.STANDARD_DIALOG,
			componentProps: {
				children: 'This is a test dialog, how did it go?'
			}
		};
	},
	[ModalTypes.CUSTOM]: (idModifier, closeModal) => {
		const id = `${idModifier}-custom`;
		return {
			id,
			type: ModalTypes.CUSTOM,
			element: (
				<div className="modal-custom-dialog">
					<p>This is a custom div being passed through to element</p>
					<button className="btn" onClick={() => closeModal(id)}>
						Close The modal
					</button>
				</div>
			)
		};
	},
	[ModalTypes.PIN_AUTH]: (idModifier, closeModal) => {
		const id = `${idModifier}-pin`;
		return {
			id,
			type: ModalTypes.PIN_AUTH,
			disableAutoClose: true,
			componentProps: {
				onFailure: () => closeModal(id),
				onSuccess: () => closeModal(id)
			}
		};
	},
	[ModalTypes.PASSWORD_AUTH]: (idModifier, closeModal) => {
		const id = `${idModifier}-password`;
		return {
			id,
			type: ModalTypes.PASSWORD_AUTH,
			disableAutoClose: true,
			componentProps: {
				onFailure: () => closeModal(id),
				onSuccess: () => closeModal(id)
			}
		};
	},
	[ModalTypes.SYSTEM_ERROR]: idModifier => {
		const id = `${idModifier}-system`;
		return {
			id,
			type: ModalTypes.SYSTEM_ERROR,
			componentProps: {
				children: (
					<div className="modal-system-error-dialog ">
						A massive system critical tachyon emitter failure occured. Shields are down to 20%.
					</div>
				)
			}
		};
	}
};

interface ModalManagerComponentsState {
	modalQueue: Array<ModalTypes>;
	disableAutoClose: boolean;
}

class ModalManagerComponents extends React.Component<ModalManagerComponentsProps, ModalManagerComponentsState> {
	state: ModalManagerComponentsState = {
		modalQueue: [],
		disableAutoClose: false
	};

	showModal = (modalType: ModalTypes | string) => {
		const { onHideModal } = this.props;
		this.props.onShowModal(configs[modalType](undefined, onHideModal, this.state.disableAutoClose));
	};

	fireQueue = () => {
		const { onHideModal } = this.props;
		this.state.modalQueue.forEach((type, index) => {
			this.props.onShowModal(configs[type](index, onHideModal));
		});

		this.setState({ modalQueue: [] });
	};

	clearQueue = () => {
		this.setState({ modalQueue: [] });
	};

	queueModal = type => {
		this.setState({ modalQueue: [type, ...this.state.modalQueue] });
	};

	toggleAutoClose = () => {
		this.setState({ disableAutoClose: !this.state.disableAutoClose });
	};

	render() {
		const { modalQueue } = this.state;
		return (
			<div className={bem.b()}>
				<h3>Modals</h3>
				<p>Now that's thinking with Modals!</p>
				<div className={bem.e('button-groups')}>
					<div className={bem.e('buttons')}>
						<h4>Modal Type Examples</h4>
						<p>All the modal types currently supported. Click to open.</p>
						<div className={bem.e('button-label')}>
							<button className="btn" onClick={() => this.showModal(ModalTypes.CONFIRMATION_DIALOG)}>
								Show Confirmation Dialog
							</button>
							<label>
								<input type="checkbox" checked={this.state.disableAutoClose} onChange={this.toggleAutoClose} />
								Disable close on background click
							</label>
						</div>
						<button className="btn" onClick={() => this.showModal(ModalTypes.STANDARD_DIALOG)}>
							Show Standard Dialog
						</button>
						<button className="btn" onClick={() => this.showModal(ModalTypes.CUSTOM)}>
							Show Custom Dialog
						</button>
						<button className="btn" onClick={() => this.showModal(ModalTypes.PIN_AUTH)}>
							Show Pin Dialog
						</button>
						<button className="btn" onClick={() => this.showModal(ModalTypes.PASSWORD_AUTH)}>
							Show Pasword Dialog
						</button>
						<button className="btn" onClick={() => this.showModal(ModalTypes.SYSTEM_ERROR)}>
							Show System Error Dialog
						</button>
					</div>
					<div className={bem.e('buttons')}>
						<h4>Modal Queue System Test</h4>
						<p>
							Queue modals up and then fire them all at once. This will test the priority system and show that the
							modals will move onto the next one in the queue after closing.
						</p>
						<div className={bem.e('spacer')}>
							<b>Queued Types:</b> {modalQueue.join(', ') || 'None'}
						</div>
						<button className="btn" onClick={() => this.queueModal(ModalTypes.CONFIRMATION_DIALOG)}>
							Queue Confirmation (P: 6)
						</button>
						<button className="btn" onClick={() => this.queueModal(ModalTypes.STANDARD_DIALOG)}>
							Queue Standard (P: 5)
						</button>
						<button className="btn" onClick={() => this.queueModal(ModalTypes.CUSTOM)}>
							Queue Custom (P: 4)
						</button>
						<button className="btn" onClick={() => this.queueModal(ModalTypes.PIN_AUTH)}>
							Queue Pin (P: 5)
						</button>
						<button className="btn" onClick={() => this.queueModal(ModalTypes.PASSWORD_AUTH)}>
							Queue Password (P: 5)
						</button>
						<button className="btn" onClick={() => this.queueModal(ModalTypes.SYSTEM_ERROR)}>
							Queue System Error (P: 10)
						</button>
						<hr className={bem.e('divider')} />
						<div className={bem.e('button-groups')}>
							<button className="btn" disabled={modalQueue.length === 0} onClick={this.fireQueue}>
								Fire off Queued Modals
							</button>
							<button className="btn" onClick={this.clearQueue}>
								Clear Queue
							</button>
						</div>
					</div>
				</div>
				<ModalManager />
			</div>
		);
	}
}

const actions = {
	onShowModal: OpenModal,
	onHideModal: CloseModal
};

export default connect<any, any, ModalManagerComponentsProps>(
	undefined,
	actions
)(ModalManagerComponents);
