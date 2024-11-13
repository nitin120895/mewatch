import IntlFormatter from '../../../component/IntlFormatter';
import * as React from 'react';
import * as cx from 'classnames';
import AccountUserDetails from './components/AccountUserDetails';
import AccountEntryWrapper from '../common/AccountEntryWrapper';
import ChangePassword from './components/ChangePassword';
import ChangePin from './components/ChangePin';
import { connect } from 'react-redux';
import * as AccountActions from 'shared/service/action/account';
import * as AccountWorkflowActions from 'shared/account/accountWorkflow';
import { A1Details as template } from 'shared/page/pageEntryTemplate';
import { Bem } from 'shared/util/styles';
import { AccountEdit as editPageKey } from 'shared/page/pageKey';
import { noop } from 'shared/util/function';
import { getPasswordErrorByCode } from 'shared/util/errorMessages';
import * as UILayerActions from 'shared/uiLayer/uiLayerWorkflow';

import './A1Details.scss';

const bem = new Bem('a1-details');

export type A1DetailsError = {
	message: string;
	type: string;
};

// For convenience when mocking we expose these base properties
// to avoid mocking an entire PageEntryProps object.
export interface A1DetailsPropsBase {
	info?: api.Account;
	sendVerification?: () => Promise<any>;
	updatePassword?: (currentPassword: string, newPassword: string) => Promise<any>;
	updatePin?: (currentPassword: string, newPassword: string) => Promise<any>;
	clearAccountError?: () => void;
	updating?: boolean;
	updateError?: boolean;
	showPassiveNotification: (config: PassiveNotificationConfig) => void;
}

interface A1DetailsProps extends A1DetailsPropsBase, PageEntryPropsBase {}

interface A1DetailsState {
	digits: number[];
	passwordOpen: boolean;
	pinOpen: boolean;
	requestStatus?: 'sending' | 'sent' | 'failed';
	updatingPassword?: boolean;
	updatingPin?: boolean;
	error?: A1DetailsError;
}

export class A1Details extends React.Component<A1DetailsProps, A1DetailsState> {
	static defaultProps = {
		info: {},
		updatePin: noop,
		updatePassword: noop,
		sendVerification: noop
	};

	state: A1DetailsState = {
		digits: undefined,
		passwordOpen: false,
		pinOpen: false
	};

	componentWillReceiveProps(nextProps: A1DetailsProps) {
		const { showPassiveNotification } = this.props;
		const { updatingPassword, updatingPin } = this.state;
		if (this.props.updating && !nextProps.updating && !nextProps.updateError) {
			if (updatingPassword) {
				this.setState({
					passwordOpen: false,
					updatingPassword: false
				});

				showPassiveNotification({
					content: <IntlFormatter>{this.getPasswordSuccess()}</IntlFormatter>
				});
			} else if (updatingPin) {
				this.setState({
					pinOpen: false,
					updatingPin: false
				});

				showPassiveNotification({
					content: <IntlFormatter>{this.getPinSuccess()}</IntlFormatter>
				});
			}
		}
	}

	private onUpdatePassword = (currentPassword: string, newPassword: string) => {
		this.setState({ updatingPassword: true, error: undefined });
		this.props.updatePassword(currentPassword, newPassword).then(res => {
			if (res.error) {
				this.setState({
					error: { message: getPasswordErrorByCode(res.payload.code), type: res.type },
					updatingPassword: false
				});
			} else {
				this.setState({
					updatingPassword: false
				});
			}
		});
	};

	private onUpdatePin = (currentPassword: string, pin: string) => {
		this.setState({ updatingPin: true, error: undefined });
		this.props.updatePin(currentPassword, pin).then(res => {
			if (res.error) {
				this.setState({
					error: { message: getPasswordErrorByCode(res.payload.code), type: res.type },
					updatingPin: false
				});
			} else {
				this.setState({
					updatingPin: false
				});
			}
		});
	};

	private cancelPasswordChange = () => {
		this.setState({ passwordOpen: false, error: undefined });
		this.props.clearAccountError();
	};

	private cancelPinChange = () => {
		this.setState({ pinOpen: false, error: undefined });
		this.props.clearAccountError();
	};

	private displayPwdForm = () => {
		this.setState({ passwordOpen: true, pinOpen: false, error: undefined });
	};

	private displayPinForm = () => {
		this.setState({ pinOpen: true, passwordOpen: false, error: undefined });
	};

	private onSendRequest = () => {
		const { sendVerification } = this.props;
		this.setState({ requestStatus: 'sending' });
		sendVerification().then(res => {
			if (res.error) {
				this.setState({ requestStatus: 'failed' });
			} else {
				this.setState({ requestStatus: 'sent' });
			}
		});
	};

	render() {
		const { info } = this.props;
		if (!info) return false;

		const { pinOpen, passwordOpen, requestStatus, error, updatingPassword, updatingPin } = this.state;
		const { firstName, lastName, email, pinEnabled, emailVerified } = info;

		return (
			<div className={cx(bem.b(), 'form-white')}>
				<AccountEntryWrapper buttonPath={`@${editPageKey}`} {...this.props}>
					<AccountUserDetails
						firstName={firstName}
						lastName={lastName}
						email={email}
						onRequestVerification={this.onSendRequest}
						requestStatus={requestStatus}
						emailVerified={emailVerified}
					/>
					<ChangePassword
						onClose={this.cancelPasswordChange}
						onDisplayPwdForm={this.displayPwdForm}
						onUpdatePassword={this.onUpdatePassword}
						isOpen={passwordOpen}
						updating={updatingPassword}
						error={error}
					/>
					<ChangePin
						onCancel={this.cancelPinChange}
						onDisplayPinForm={this.displayPinForm}
						onUpdatePin={this.onUpdatePin}
						isOpen={pinOpen}
						updating={updatingPin}
						pinEnabled={pinEnabled}
						error={error}
					/>
				</AccountEntryWrapper>
			</div>
		);
	}

	private getPasswordSuccess() {
		return <IntlFormatter>{'@{account_a1_password_updated|Password has been updated}.'}</IntlFormatter>;
	}

	private getPinSuccess() {
		// whether or not we reset (changed) the pin or just create one
		const resetPin = this.props.info.pinEnabled;
		return (
			<IntlFormatter values={{ action: resetPin ? 'reset' : 'created' }}>
				{'@{account_a1_pin_update|PIN has been created/reset}.'}
			</IntlFormatter>
		);
	}
}

const actions = {
	sendVerification: AccountActions.requestEmailVerification,
	updatePassword: AccountWorkflowActions.changePassword,
	updatePin: AccountWorkflowActions.changePin,
	clearAccountError: AccountWorkflowActions.clearAccountError,
	showPassiveNotification: UILayerActions.ShowPassiveNotification
};

function mapStateToProps(state: state.Root) {
	const info = state.account ? state.account.info : ({} as api.Account);
	return {
		info,
		updating: state.account.updating,
		updateError: state.account.updateError
	};
}

const Component: any = connect<any, any, A1DetailsProps>(
	mapStateToProps,
	actions
)(A1Details);
Component.template = template;

export default Component;
