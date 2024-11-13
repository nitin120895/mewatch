import { connect } from 'react-redux';
import { UpsellScreen } from 'shared/page/pageKey';
import { CarouselModal, StateProps } from 'toggle/responsive/component/modal/CarouselModal';

export const UPSELL_SCREEN_MODAL = 'upsell-screen-modal';

function mapStateToProps({ app }: state.Root): StateProps {
	return {
		config: app.config,
		pageKey: UpsellScreen
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
