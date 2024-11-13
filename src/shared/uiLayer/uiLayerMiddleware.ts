import { CLOSE_MODAL, showOnboardingScreen } from './uiLayerWorkflow';

const uiLayerMiddleware = store => next => action => {
	switch (action.type) {
		case CLOSE_MODAL:
			// check if we should show onboarding screen modal, e.g. after GuidesTipsModal close
			const dispatch = store.dispatch;
			dispatch(showOnboardingScreen());
			break;
	}
	return next(action);
};

export default uiLayerMiddleware;
