import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import { checkBrowserSupport } from 'shared/page/pageUtil';
import { SetBannerVisibility } from 'shared/uiLayer/uiLayerWorkflow';
import { Bem } from 'shared/util/styles';
import { CLOSE_BUTTON_SELECTOR, CTA_SELECTOR } from 'toggle/responsive/app/banner/BannerManager';
import { addBodyClass, removeBodyClass, setCSSVar } from 'toggle/responsive/util/cssUtil';

import AppLoading from 'ref/responsive/AppLoading';
import BannerManager from 'toggle/responsive/app/banner/BannerManager';
import { CastPlayerLoader } from 'ref/responsive/player/cast/CastLoader';
import ModalManager from 'toggle/responsive/app/modal/ModalManager';
import PassiveNotificationManager from 'toggle/responsive/app/passiveNotifications/PassiveNotificationManager';
import ProfileSelector from 'toggle/responsive/app/auth/profile/ProfileSelector';
import ReminderManager from 'toggle/responsive/pageEntry/epg/ReminderManager';

interface AppCommonState {
	modalActive: boolean;
	firstLoad: boolean;
	scrollY: number;
	isBannerVisible: boolean;
}

interface AppCommonDispatchProps {
	setBannerState: (bannerState: boolean) => void;
}

interface AppCommonStateProps {
	isBannerVisible: boolean;
}

type AppCommonProps = AppCommonDispatchProps & AppCommonStateProps;

export const DebugGrid = _DEV_ || _QA_ ? require('ref/responsive/DebugGrid').default : undefined;
const bemWrapper = new Bem('root-block');
const MODAL_ACTIVE_CLASS = 'modal-active';
const BANNER_DELAY = 1000;
class AppCommon extends React.Component<AppCommonProps, AppCommonState> {
	state = {
		modalActive: false,
		firstLoad: true,
		scrollY: 0,
		isBannerVisible: false
	};

	onModalActiveChange = (value: boolean) => {
		const { scrollY } = this.state;
		this.setState({ modalActive: value });

		if (value) {
			this.setState({ scrollY: window.scrollY }, () => {
				addBodyClass(MODAL_ACTIVE_CLASS);
				document.body.style.top = `-${scrollY}px`;
			});
		} else {
			removeBodyClass(MODAL_ACTIVE_CLASS);
			window.scrollTo(0, scrollY);
		}
	};

	componentDidMount() {
		this.checkBannerVisibility();
		checkBrowserSupport();
		setCSSVar();
		window.addEventListener('resize', setCSSVar);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', setCSSVar);
	}

	checkBannerVisibility = () => {
		// Using specific data attributes for element selection instead of a generic class .responsive-wrapper
		const isBannerVisible = document.querySelectorAll(`${CLOSE_BUTTON_SELECTOR},${CTA_SELECTOR}`).length > 0;

		if (isBannerVisible) {
			this.props.setBannerState(true);
		} else {
			// If banner is not visible, check again after a delay
			setTimeout(this.checkBannerVisibility, BANNER_DELAY);
		}
	};

	render() {
		const { children, isBannerVisible } = this.props;

		return (
			<div className={cx(bemWrapper.b(), { [MODAL_ACTIVE_CLASS]: this.state.modalActive })}>
				{isBannerVisible && <BannerManager />}
				{DebugGrid ? <DebugGrid /> : undefined}
				{children}
				<CastPlayerLoader />
				<AppLoading />
				<ModalManager onModalActive={this.onModalActiveChange} scope="app" />
				<PassiveNotificationManager />
				<ProfileSelector />
				<ReminderManager />
			</div>
		);
	}
}

function mapStateToProps({ uiLayer }: state.Root): AppCommonStateProps {
	return {
		isBannerVisible: uiLayer.isBannerVisible
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setBannerState: isVisible => dispatch(SetBannerVisibility(isVisible))
	};
}

export default connect<AppCommonStateProps, AppCommonDispatchProps, any>(
	mapStateToProps,
	mapDispatchToProps
)(AppCommon);
