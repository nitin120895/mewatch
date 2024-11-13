import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import Overlay from 'ref/responsive/component/Overlay';
import { CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { noop } from 'shared/util/function';
import { debounce } from 'shared/util/performance';
import Modal from './Modal';

import './ModalManager.scss';

interface ModalManagerProps extends React.Props<any> {
	modals?: Array<ModalConfig>;
	closeModal?: (id: string | number) => void;
	onModalActive?: (value: boolean) => void;
}

interface ModalManagerState {
	modalOnShow?: ModalConfig;
	isClosing?: boolean;
	removeOnClose?: boolean;
}

const bem = new Bem('modal-manager');

// Modal Priorities are ranked from 1-10
const ModalPriorityConfig = {
	[ModalTypes.SYSTEM_ERROR]: 10,
	[ModalTypes.CONFIRMATION_DIALOG]: 6,
	[ModalTypes.PASSWORD_AUTH]: 5,
	[ModalTypes.PIN_AUTH]: 5,
	[ModalTypes.STANDARD_DIALOG]: 5,
	[ModalTypes.CUSTOM]: 4
};
// We don't want an open modal to be forcefully closed as a general rule
// so use this to make it the 2nd highest priority. Only system errors can override it
const CurrentModalPriority = 9;

function getHighestPriorityModal(modals: Array<ModalConfig> = [], current?: ModalConfig): ModalConfig {
	return modals.sort((a, b) => {
		const aPrior = a === current ? CurrentModalPriority : ModalPriorityConfig[a.type];
		const bPrior = b === current ? CurrentModalPriority : ModalPriorityConfig[b.type];
		if (aPrior === bPrior) return 0;
		return aPrior > bPrior ? -1 : 1;
	})[0];
}

class ModalManager extends React.PureComponent<ModalManagerProps, ModalManagerState> {
	static defaultProps = {
		modals: [],
		closeModal: noop
	};

	state: ModalManagerState = {
		modalOnShow: this.props.modals[0]
	};

	private container: HTMLElement;

	componentWillReceiveProps(nextProps: ModalManagerProps) {
		if (this.props.modals !== nextProps.modals) {
			const { modalOnShow } = this.state;
			// different list, check to see if we're showing the highest priority item
			const highest = getHighestPriorityModal(nextProps.modals, modalOnShow);
			if (highest && !modalOnShow) {
				this.setState({ modalOnShow: highest });
			} else if (highest && highest !== modalOnShow) {
				// new 'highest' modal, close the current one
				this.closeModal();
			} else if (this.props.modals.length > 0 && modalOnShow) {
				// if we no longer have any modals, close the currently open one
				this.props.onModalActive(false);
				this.closeModal();
			}
		}
	}

	componentDidUpdate(prevProps: ModalManagerProps, prevState: ModalManagerState) {
		const { modalOnShow, removeOnClose } = this.state;
		// check if we just finished closing a modal
		if (prevState.modalOnShow && !modalOnShow) {
			this.props.onModalActive(false);
			if (removeOnClose) {
				// removes from the reducer, updated modals list will
				// ensure the next highest one gets displayed
				this.props.closeModal(prevState.modalOnShow.id);
			} else {
				// Already removed from reducer, modal list won't change
				// so set up the next one to show ourselves
				const highest = getHighestPriorityModal(this.props.modals);
				this.setState({ modalOnShow: highest });
			}
		} else {
			this.props.onModalActive(true);
		}
	}

	// Called when a modal was closed by being removed from the modals list
	private closeModal = () => {
		this.props.onModalActive(false);
		this.setState({ isClosing: true, removeOnClose: false });
	};

	// Called when a modal was explicitly removed
	private closeAndRemoveModal = () => {
		const { modalOnShow } = this.state;
		if (modalOnShow.onClose) modalOnShow.onClose();
		if (modalOnShow.componentProps) {
			const { onFailure } = modalOnShow.componentProps;
			if (onFailure) onFailure({ isCancelled: true });
		}
		this.setState({ isClosing: true, removeOnClose: true });
	};

	private onModalClosed = debounce(() => {
		this.setState({ isClosing: false, modalOnShow: undefined });
	}, 10);

	private onTransitionEnd = e => {
		const { isClosing, modalOnShow } = this.state;
		// we're trying to listen on the fade out transitions on the overlay/container. So make sure the target
		// is one of those two. Both last 0.3 seconds.
		if (isClosing && modalOnShow && e.target === this.container) {
			this.onModalClosed();
		}
	};

	private containerRef = node => {
		this.container = node;
	};

	render() {
		const { modals } = this.props;
		const { modalOnShow, isClosing } = this.state;

		// Whether there is a modal currently to show
		const shouldShowModal = !!modalOnShow && !isClosing;
		const onClose = modalOnShow && modalOnShow.disableAutoClose ? undefined : this.closeAndRemoveModal;

		return (
			<div className={bem.b({ hidden: modals.length === 0 && !isClosing })} onTransitionEnd={this.onTransitionEnd}>
				<Overlay onDismiss={onClose} opened={modals.length > 1 || (modals.length === 1 && !isClosing)}>
					<div className={bem.e('modal-container', shouldShowModal ? undefined : 'hidden')} ref={this.containerRef}>
						{modalOnShow && <Modal modal={modalOnShow} onClose={onClose} />}
					</div>
				</Overlay>
			</div>
		);
	}
}

function mapStateToProps(state: { uiLayer: state.UILayerState }) {
	return {
		modals: state.uiLayer.modals
	};
}

const actions = {
	closeModal: CloseModal
};

export default connect<any, any, ModalManagerProps>(
	mapStateToProps,
	actions
)(ModalManager);
