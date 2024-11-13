import * as React from 'react';
import OnboardingModal, { ONBOARDING_SCREEN_MODAL } from 'toggle/responsive/component/modal/OnboardingScreenModal';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OwnProps } from 'toggle/responsive/component/modal/CarouselModal';

export function getOnboardingModal(props: OwnProps): ModalConfig {
	return {
		id: ONBOARDING_SCREEN_MODAL,
		type: ModalTypes.CUSTOM,
		element: <OnboardingModal {...props} />,
		disableAutoClose: true,
		componentProps: {
			className: 'onboarding-screen-modal'
		}
	};
}
