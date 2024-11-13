import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import FacebookButton, { FacebookLoginInfo } from 'ref/responsive/component/input/FacebookButton';
import Checkbox from 'ref/responsive/component/input/Checkbox';
import TextInput from 'ref/responsive/component/input/TextInput';
import PasswordInput from 'ref/responsive/component/input/PasswordInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Register, ResetPassword } from 'shared/page/pageKey';

const bem = new Bem('sign-in-form');

import './SignInForm.scss';

interface SignInFormState {
	email: string;
	password: string;
	remember: boolean;
	submitting: boolean;
	submittingFb: boolean;
	error: string;
}

interface SignInFormProps {
	getRedirectPath: (defaultPath?: string) => string;
	signIn: (email: string, password: string, remember: boolean, scopes: string[], redirectPath?: string) => Promise<any>;
	singleSignOn: (options: api.SingleSignOnRequestOmited, redirectPath: string) => Promise<any>;
	fbAppId?: string;
}

const errorCodeMap = {
	0: 'form_signIn_invalid_credentials_msg',
	2: 'form_signIn_locked_account_msg',
	4: 'form_signIn_invalid_credentials_msg',
	400: 'form_signIn_invalid_credentials_msg', // 400 is placeholder using http status because of no error code
	6000: 'form_signIn_fb_unknown_error_msg',
	6001: 'form_signIn_fb_email_exists_msg',
	6002: 'form_signIn_fb_invalid_token_msg',
	6003: 'form_signIn_fb_existing_link_msg',
	6004: 'form_signIn_fb_no_email_msg'
};

export default class SignInForm extends React.Component<SignInFormProps, SignInFormState> {
	private mounted = false;

	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: '',
			remember: false,
			submittingFb: false,
			submitting: false,
			error: undefined
		};
	}

	componentDidMount() {
		// It's somewhat of an anti-pattern keeping track of mounted state
		// but does the job of avoiding setting state post unmount
		this.mounted = true;
	}

	componentWillUnmount() {
		this.loadComplete();
		this.mounted = false;
	}

	private loadComplete() {
		if (!this.mounted) return;
		this.setState({ submitting: false, submittingFb: false });
	}

	private displayState() {
		const { submitting, submittingFb, error } = this.state;
		if (error) return 'error';
		if (submitting || submittingFb) return 'disabled';
		return 'default';
	}

	private signInError(e) {
		if (!this.mounted) return;
		if (_DEV_) console.warn('Sign in error', e);
		const msg = errorCodeMap[e.code || e.status || 0];
		this.setState({ submittingFb: false, submitting: false, error: msg });
	}

	private facebookSignInFailed(info: FacebookLoginInfo) {
		if (!this.mounted) return;
		if (_DEV_) console.warn('Facebook single sign on failed', info);
		let msg;
		if (info.authResponse.missingPermissions) {
			msg = 'form_signIn_fb_missing_permissions_msg';
		} else {
			msg = 'form_signIn_fb_auth_error_msg';
		}
		this.setState({ submittingFb: false, error: msg });
	}

	private onSubmit = e => {
		e.preventDefault();
		const { email, password, remember } = this.state;
		this.setState({ submitting: true, error: undefined });
		const redirectPath = this.props.getRedirectPath();
		this.props
			.signIn(email, password, remember, ['Catalog'], redirectPath)
			.then(() => this.loadComplete())
			.catch(e => this.signInError(e));
	};

	private onFacebookSignInPending = () => {
		this.setState({ submittingFb: true, error: undefined });
	};

	private onFacebookSignIn = (info: FacebookLoginInfo) => {
		if (!info.authResponse && !info.status) {
			// user cancelled the Facebook sign in so reset and continue
			return this.loadComplete();
		}
		if (info.status !== 'connected' || info.authResponse.missingPermissions) {
			return this.facebookSignInFailed(info);
		}
		this.props
			.singleSignOn(
				{
					provider: 'Facebook',
					token: info.authResponse.accessToken,
					// for now we'll default to auto link any existing
					// user account with their Facebook one if found.
					linkAccounts: true
				},
				this.props.getRedirectPath()
			)
			.then(() => this.loadComplete())
			.catch(e => this.signInError(e));
	};

	private onCheckBoxChange = e => this.setState({ remember: !this.state.remember });

	private onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			[e.target.name]: e.target.value,
			error: undefined
		} as any);
	};

	private onReference = node => {
		// need to wait for autofill to occur before setting focus otherwise it
		// blocks the onchange event.
		if (node) {
			setTimeout(() => {
				if (!this.mounted) return;
				window.focus();
				node.focus();
			}, 200);
		}
	};

	render() {
		const { remember, submitting, submittingFb, error, email } = this.state;
		const displayState = this.displayState();
		return (
			<div className={cx(bem.b())}>
				{this.renderFacebookButton(this.props, this.state)}
				{displayState === 'error' && (
					<IntlFormatter tagName="p" className="pg-auth-error">
						{`@{${error}|Sign in Error}`}
					</IntlFormatter>
				)}
				<form className={bem.e('form')} onSubmit={this.onSubmit}>
					<TextInput
						type={'email'}
						displayState={displayState}
						required={true}
						name={'email'}
						label={'@{form_signIn_email_label|Email}'}
						id={'email'}
						onChange={this.onTextChange}
						onReference={this.onReference}
					/>
					<PasswordInput
						type={'password'}
						displayState={displayState}
						name={'password'}
						label={'@{form_signIn_password_label|Password}'}
						id={'password'}
						onChange={this.onTextChange}
					/>
					<div className={cx(bem.e('secondary-actions'), 'clearfix')}>
						<Checkbox
							label={'@{form_signIn_rememberMe_label|Remember Me}'}
							name={'remember'}
							checked={remember}
							className={bem.e('remember-me')}
							disabled={submitting || submittingFb}
							onChange={this.onCheckBoxChange}
						/>
						<IntlFormatter
							elementType={Link}
							className={cx(bem.e('forgot-pwd'), 'link')}
							componentProps={{ to: `@${ResetPassword}${email ? `?email=${email}` : ''}` }}
						>
							{'@{form_signIn_forgotPassword_label|Forgot Password?}'}
						</IntlFormatter>
					</div>
					<div className={bem.e('primary-action')}>
						<IntlFormatter
							elementType={AccountButton}
							componentProps={{
								type: 'submit',
								ordinal: 'primary',
								theme: 'blue',
								disabled: submittingFb,
								loading: submitting,
								large: true
							}}
						>
							{!submitting && '@{form_signIn_signInButton_label|Sign In}'}
							{submitting && '@{form_signIn_signInButton_submitting_label|Signing In}'}
						</IntlFormatter>
					</div>
					<div className={bem.e('tertiary-actions')}>
						<IntlFormatter
							elementType={Link}
							className={cx(bem.e('register'), 'link')}
							componentProps={{ to: `@${Register}` }}
						>
							{'@{form_signIn_createAccount_label|Create Account}'}
						</IntlFormatter>
					</div>
				</form>
			</div>
		);
	}

	private renderFacebookButton({ fbAppId }: SignInFormProps, { submitting, submittingFb }: SignInFormState) {
		if (!fbAppId) return false;
		return (
			<div className={bem.e('primary-action')}>
				<FacebookButton
					fbAppId={fbAppId}
					onLoginStatusChange={this.onFacebookSignIn}
					onLoginPending={this.onFacebookSignInPending}
					disabled={submitting}
					loading={submittingFb}
					requiredPermissions={['email']}
				/>
			</div>
		);
	}
}
