import { PAGE_CHANGE } from '../page/pageWorkflow';
import ModalTypes from './modalTypes';
import getGuidingTipModal from 'toggle/responsive/component/modal/GuidingTipModal';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { GuidingTip } from 'shared/guides/guidesManager';
import { keepOpenPermanentModals } from 'toggle/responsive/util/modalUtil';
import { fullscreenService } from './fullScreenWorkflow';
import { isSafari, isIOS } from 'shared/util/browser';
import { onboardingManager } from 'shared/uiLayer/onboardingManager';

// Modal Action constants
export const SHOW_GUIDING_TIP = 'SHOW_GUIDING_TIP';
export const CLOSE_MODAL = 'CLOSE_MODAL';
export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_ALL_MODALS = 'HIDE_ALL_MODALS';
export const CLOSE_PASSIVE_NOTIFICATION = 'CLOSE_PASSIVE_NOTIFICATION';
export const SHOW_PASSIVE_NOTIFICATION = 'SHOW_PASSIVE_NOTIFICATION';
export const TOGGLE_CONTENT = 'TOGGLE_CONTENT';
export const SHARE_MODAL_SOCIAL_PLATFORM = 'SHARE_MODAL_SOCIAL_PLATFORM';
const SET_BANNER_VISIBILITY = 'SET_BANNER_VISIBILITY';

/**
 *
 * ACTIONS
 *
 */

/**
 * Close the currently open modal
 */
export function CloseModal(id: string | number) {
	return {
		type: CLOSE_MODAL,
		payload: { id }
	};
}

export function OpenModal(modalConfig: ModalConfig) {
	let target = fullscreenService.isFullScreen() ? 'player' : 'app';
	if (modalConfig.target) target = modalConfig.target;
	return {
		type: SHOW_MODAL,
		payload: {
			modalConfig: {
				target,
				...modalConfig
			}
		}
	};
}

export function ToggleContent(showContent: boolean) {
	return {
		type: TOGGLE_CONTENT,
		payload: {
			showContent
		}
	};
}

export function showGuidingTipAction(guidingTip: GuidingTip, pageKey: string, action: AnalyticsEventType) {
	return { type: SHOW_GUIDING_TIP, payload: { guidingTip, pageKey, action } };
}

export const showOnboardingScreen = () => (dispatch, getState): void => {
	const state: state.Root = getState();

	onboardingManager.showOnboardingScreen(dispatch, state);
};

export function HideAllModals() {
	return { type: HIDE_ALL_MODALS };
}

export function ClosePassiveNotification() {
	return {
		type: CLOSE_PASSIVE_NOTIFICATION
	};
}

export function ShowPassiveNotification(passiveNotificationConfig: PassiveNotificationConfig) {
	const config = {
		...passiveNotificationConfig,
		position: passiveNotificationConfig.position || 'top'
	};

	return {
		type: SHOW_PASSIVE_NOTIFICATION,
		payload: { config }
	};
}

export function LastSharedSocialPlatform(platform: string) {
	return {
		type: SHARE_MODAL_SOCIAL_PLATFORM,
		payload: { platform }
	};
}

export function SetBannerVisibility(isBannerVisible: boolean) {
	return {
		type: SET_BANNER_VISIBILITY,
		payload: {
			isBannerVisible
		}
	};
}
/**
 *
 * REDUCER
 *
 */

const initialState: state.UILayerState = {
	modals: { app: [], player: [], linearPlayer: [] },
	passiveNotification: undefined,
	showContent: true,
	sharedSocialPlatform: undefined,
	isBannerVisible: false
};

function uiLayerReducer(state: state.UILayerState = initialState, action: Action<any>): state.UILayerState {
	switch (action.type) {
		case CLOSE_MODAL: {
			return {
				...state,
				modals: Object.keys(state.modals).reduce((acc, k) => {
					acc[k] = state.modals[k].filter(modal => modal.id !== action.payload.id);
					return acc;
				}, {})
			};
		}
		case SHOW_MODAL: {
			const scope = action.payload.modalConfig.target;
			return {
				...state,
				modals: {
					...state.modals,
					...{ [scope]: [...state.modals[scope], action.payload.modalConfig] }
				}
			};
		}
		case SHOW_PASSIVE_NOTIFICATION: {
			return {
				...state,
				passiveNotification: action.payload.config
			};
		}
		case CLOSE_PASSIVE_NOTIFICATION: {
			return {
				...state,
				passiveNotification: undefined
			};
		}
		case PAGE_CHANGE: {
			return {
				...state,
				modals: keepOpenPermanentModals(state.modals)
			};
		}
		case HIDE_ALL_MODALS: {
			return {
				...state,
				modals: { app: [], player: [], linearPlayer: [] }
			};
		}
		case SHOW_GUIDING_TIP: {
			return reduceGuidingTipModal(state, action);
		}
		case TOGGLE_CONTENT: {
			if (!isSafari() || isIOS()) return state;

			return {
				...state,
				showContent: action.payload.showContent
			};
		}
		case SHARE_MODAL_SOCIAL_PLATFORM: {
			return {
				...state,
				sharedSocialPlatform: action.payload.platform
			};
		}
		case SET_BANNER_VISIBILITY:
			return {
				...state,
				isBannerVisible: action.payload
			};
	}
	return state;
}

export const GUIDING_TIP_MODAL_ID = 'GUIDING_TIP_MODAL';
function reduceGuidingTipModal(state, action) {
	const target = 'app';
	const modalConfig = {
		target: target,
		id: GUIDING_TIP_MODAL_ID,
		type: ModalTypes.CUSTOM,
		element: getGuidingTipModal(action.payload.guidingTip),
		componentProps: {
			className: GUIDING_TIP_MODAL_ID
		}
	};

	return {
		...state,
		modals: {
			...state.modals,
			...{ [target]: [...state.modals[target], modalConfig] }
		}
	};
}

export default uiLayerReducer;
