import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import { mcSSOSignIn } from 'shared/mcSSOService/action/mcSSOAuthorization';
import { singleSignOn } from 'shared/service/action/authorization';
import Spinner from 'ref/responsive/component/Spinner';
import { bem, CreatePinSteps } from './CreatePinOverlay';
import PasswordInput from '../../../../component/input/PasswordInput';
import CtaButton from 'ref/responsive/component/CtaButton';
import { getDeviceId } from 'shared/util/deviceUtil';

interface OwnProps {
	step: CreatePinSteps;
	account: api.Account;
	continueToNextStep: () => void;
	close?: () => void;
}

interface DispatchProps {
	mcSSOSignIn: (username: string, password: string) => Promise<any>;
	singleSignOn: (options: api.SingleSignOnRequest) => Promise<any>;
}

type Props = OwnProps & DispatchProps;

interface State {
	password: string;
	displayState: string;
	message: string;
	loading: boolean;
}

class CreatePinStepPassword extends React.Component<Props, State> {
	state = {
		password: '',
		displayState: 'default',
		message: '',
		loading: false
	};

	private onPasswordChange = e => {
		this.setState({
			password: e.target.value,
			displayState: 'default',
			message: ''
		});
	};

	private onPasswordBlur = e => {
		if (!this.state.password)
			this.setState({
				displayState: 'error',
				message: '@{create_pin_overlay_password_password_required|This is a required field}'
			});
		else {
			this.setState({
				displayState: 'default',
				message: ''
			});
		}
	};

	private onProceedClick = e => {
		const { password } = this.state;
		if (!password) return;
		const { account, mcSSOSignIn } = this.props;

		this.setState({ loading: true });
		mcSSOSignIn(account.email, password).then(response => {
			if (response.error) this.setError();
			else this.onSignInSuccess(response.payload);
		});
	};

	private onSignInSuccess = data => {
		const { singleSignOn, continueToNextStep } = this.props;
		singleSignOn({
			provider: 'Mediacorp',
			token: data.token,
			linkAccounts: true,
			scopes: ['Settings'],
			deviceId: getDeviceId()
		})
			.then(() => {
				this.setState({ loading: false });
				continueToNextStep();
			})
			.catch(this.setError);
	};

	private setError = () => {
		this.setState({
			displayState: 'error',
			message: '@{create_pin_overlay_password_password_incorrect|Password is incorrect}',
			loading: false
		});
	};

	render() {
		const { step, close } = this.props;
		const { password, displayState, message, loading } = this.state;

		if (step !== CreatePinSteps.Password) return false;
		if (loading) return <Spinner className={bem.e('spinner')} />;

		return (
			<div className={bem.e('step')}>
				<IntlFormatter className={bem.e('title')} elementType="div">
					{'@{create_pin_overlay_password_title|Please confirm your password to proceed}'}
				</IntlFormatter>

				<div className={bem.e('fields')}>
					<PasswordInput
						id="password"
						name="password"
						type="password"
						displayState={displayState as form.DisplayState}
						label={'@{create_pin_overlay_password_label|Password}'}
						onChange={this.onPasswordChange}
						onBlur={this.onPasswordBlur}
						value={password}
						message={message}
						focus={true}
					/>

					<IntlFormatter
						className={bem.e('forgot-password')}
						elementType={Link}
						onClick={close}
						componentProps={{ to: '/reset-password' }}
					>
						{'@{create_pin_overlay_password_forgot_password|Forgot password?}'}
					</IntlFormatter>
				</div>

				{this.renderFooter()}
			</div>
		);
	}

	renderFooter() {
		const { close } = this.props;

		return (
			<div className={bem.e('buttons')}>
				<CtaButton className={bem.e('button')} ordinal="primary" onClick={this.onProceedClick}>
					<IntlFormatter elementType="span">{'@{create_pin_overlay_proceed|Proceed}'}</IntlFormatter>
				</CtaButton>

				<CtaButton className={bem.e('button')} ordinal="secondary" onClick={close}>
					<IntlFormatter elementType="span">{'@{create_pin_overlay_cancel|Cancel}'}</IntlFormatter>
				</CtaButton>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		mcSSOSignIn: (email, password) => dispatch(mcSSOSignIn(email, password)),
		singleSignOn: (options: api.SingleSignOnRequest) => dispatch(singleSignOn(options))
	};
}

export default connect<any, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(CreatePinStepPassword);
