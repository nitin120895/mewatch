import * as React from 'react';
import { connect } from 'react-redux';
import AppLoading from './AppLoading';
import ModalManager from './app/modal/ModalManager';
import PassiveNotificationManager from './app/passiveNotifications/PassiveNotificationManager';
import ProfileSelector from './app/auth/profile/ProfileSelector';
import { CastPlayerLoader } from './player/cast/CastLoader';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

interface AppCommonProps {
	showChildren: boolean;
}

interface AppCommonState {
	modalActive: boolean;
}

export const DebugGrid = _DEV_ || _QA_ ? require('./DebugGrid').default : undefined;
const bemWrapper = new Bem('root-block');

class AppCommon extends React.Component<AppCommonProps, AppCommonState> {
	state = {
		modalActive: false
	};

	onModalActiveChange = (value: boolean) => {
		this.setState({ modalActive: value });
	};

	render() {
		const { children, showChildren } = this.props;
		return (
			<div className={cx(bemWrapper.b(), { 'modal-active': this.state.modalActive })}>
				{DebugGrid ? <DebugGrid /> : undefined}
				{showChildren && children}
				<CastPlayerLoader />
				<AppLoading />
				<ModalManager onModalActive={this.onModalActiveChange} />
				<PassiveNotificationManager />
				<ProfileSelector />
			</div>
		);
	}
}

function mapStateToProps({ session, account }: state.Root): AppCommonProps {
	const isSignedIn = !!session.tokens.length;
	const activeAccount = account.active;
	return {
		showChildren: session.profileSelected || !isSignedIn || !activeAccount
	};
}

export default connect<any, any, AppCommonProps>(mapStateToProps)(AppCommon);
