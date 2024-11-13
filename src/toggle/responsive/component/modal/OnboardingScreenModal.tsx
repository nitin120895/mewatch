import { connect } from 'react-redux';
import { OnboardingScreen } from 'shared/page/pageKey';
import { CarouselModal, StateProps } from 'toggle/responsive/component/modal/CarouselModal';

import './OnboardingScreenModal.scss';

export const ONBOARDING_SCREEN_MODAL = 'onboarding-screen-modal';

function mapStateToProps({ app }: state.Root): StateProps {
	return {
		config: app.config,
		pageKey: OnboardingScreen
	};
}

export default connect<StateProps, any, any>(
	mapStateToProps,
	undefined,
	undefined,
	{
		withRef: true
	}
)(CarouselModal);
