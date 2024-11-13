import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import Overlay from '../../component/Overlay';
import { CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { noop } from 'shared/util/function';
import { debounce } from 'shared/util/performance';
import Modal from 'toggle/responsive/app/modal/Modal';
import * as cx from 'classnames';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { UPSELL_MODAL } from 'toggle/responsive/util/subscriptionUtil';
import { goBackToPreviousAccessPoint } from 'toggle/responsive/util/playerUtil';
import { pageTemplate } from 'shared';
import { get } from 'shared/util/objects';
import { REQUIRE_MODAL_ID } from '../../player/playerModals';

import './ModalManager.scss';

interface ModalManagerOwnProps extends React.Props<any> {
	onModalActive?: (value: boolean) => void;
	scope: ModalConfig['target'];
}

interface ModalManagerStateProps {
	modals?: Array<ModalConfig>;
	isChannelDetailPage: boolean;
}

export interface ModalManagerDispatchProps {
	closeModal?: (id: string | number) => void;
	modalShownAnalyticsEvent?: any;
}

interface ModalManagerState {
	modalOnShow?: ModalConfig;
	isClosing?: boolean;
	removeOnClose?: boolean;
}
type ModalManagerProps = ModalManagerOwnProps & ModalManagerStateProps & ModalManagerDispatchProps;

const bem = new Bem('modal-manager');

// Modal Priorities are ranked from 1-10
const ModalPriorityConfig = {
	[ModalTypes.SYSTEM_ERROR]: 10,
	[ModalTypes.PASSWORD_AUTH]: 7,
	[ModalTypes.CONFIRMATION_DIALOG]: 6,
	[ModalTypes.PIN_CREATE]: 5,
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
	private mainContainer: HTMLElement;

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
			} else if (this.props.modals.length > 0 && modalOnShow && !nextProps.modals.length) {
				// if we no longer have any modals, close the currently open one
				this.props.onModalActive(false);
				this.closeModal();
			}
		}
	}

	componentDidUpdate(prevProps: ModalManagerProps, prevState: ModalManagerState) {
		const { modalOnShow, removeOnClose, isClosing } = this.state;
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
		} else if (!prevState.modalOnShow && modalOnShow) {
			this.props.onModalActive(true);

			const analyticsPath = modalOnShow && modalOnShow.id && getPathForModal(modalOnShow.id);
			if (analyticsPath && !isClosing) {
				this.props.modalShownAnalyticsEvent(analyticsPath);
			}
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

		if (this.props.isChannelDetailPage && modalOnShow.type === ModalTypes.PIN_AUTH) {
			goBackToPreviousAccessPoint();
		}
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

	private mainContainerRef = node => {
		this.mainContainer = node;
	};

	private containerRef = node => {
		this.container = node;
	};

	render() {
		const { modals, scope } = this.props;
		const { modalOnShow, isClosing } = this.state;

		// Whether there is a modal currently to show
		const shouldShowModal = !!modalOnShow && !isClosing;
		const onOverlayClose = modalOnShow && modalOnShow.disableAutoClose ? undefined : this.closeAndRemoveModal;
		const enableScroll = modalOnShow && modalOnShow.enableScroll;
		const positionTop = modalOnShow && modalOnShow.componentProps && modalOnShow.componentProps.style;
		const className = modalOnShow && modalOnShow.componentProps && modalOnShow.componentProps.className;
		const isOverlayTransparent = modalOnShow && modalOnShow.transparentOverlay;

		const style = positionTop ? { marginTop: `${positionTop}px` } : undefined;

		return (
			<div
				className={cx(
					bem.b({ hidden: !modals.length && !isClosing, 'player-scope': scope === ('player' || 'linearPlayer') }),
					className
				)}
				onTransitionEnd={this.onTransitionEnd}
				style={style}
				ref={this.mainContainerRef}
			>
				<Overlay
					enableScroll={enableScroll}
					onDismiss={onOverlayClose}
					opened={modals.length > 1 || (modals.length === 1 && !isClosing)}
					isTransparent={isOverlayTransparent}
				>
					<div className={bem.e('modal-container', shouldShowModal ? undefined : 'hidden')} ref={this.containerRef}>
						{modalOnShow && (
							<Modal container={this.mainContainer} modal={modalOnShow} onClose={this.closeAndRemoveModal} />
						)}
					</div>
				</Overlay>
			</div>
		);
	}
}

function mapStateToProps(state: { uiLayer: state.UILayerState }, ownProps: ModalManagerProps) {
	const isChannelDetailPage = get(state, 'page.history.pageSummary.template') === pageTemplate.ChannelDetail;
	return {
		modals: state.uiLayer.modals[ownProps.scope],
		isChannelDetailPage
	};
}

const ModalShownAnalyticsEvent = path => {
	return dispatch =>
		dispatch(
			analyticsEvent(AnalyticsEventType.GENERIC_ANALYTICS_EVENT, {
				path,
				type: 'Page'
			})
		);
};

const getPathForModal = id => {
	switch (id) {
		case UPSELL_MODAL:
			return '/upsell';
		case REQUIRE_MODAL_ID:
			return '/mandatorylogin';
	}
};

const actions = {
	modalShownAnalyticsEvent: ModalShownAnalyticsEvent,
	closeModal: CloseModal
};

export default connect<any, ModalManagerDispatchProps, ModalManagerOwnProps>(
	mapStateToProps,
	actions
)(ModalManager);
