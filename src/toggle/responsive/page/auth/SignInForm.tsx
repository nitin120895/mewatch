import * as React from 'react';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import FacebookIcon from 'ref/responsive/component/icons/FacebookIcon';
import AppleIcon from 'toggle/responsive/component/icons/AppleIcon';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';
import { Register, ResetPassword, ColdStart, Privacy, TermsAndConditions } from 'shared/page/pageKey';
import { mcSSOSignIn } from 'shared/mcSSOService/action/mcSSOAuthorization';
import { addQueryParameterToURL, getQueryParams } from 'shared/util/urls';
import { getSignInPath, getPathByKey } from 'shared/page/sitemapLookup';
import { browserHistory } from 'shared/util/browserHistory';
import { setRedirectPathAfterSignin, setIsSocialAccount, removeIsSocialAccount } from 'shared/page/pageUtil';
import TextInput from 'toggle/responsive/component/input/TextInput';
import PasswordInput from 'toggle/responsive/component/input/PasswordInput';
import { getSubscriptionPagePath } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import MeConnectLogo from 'toggle/responsive/component/icons/ssoIcons/MeConnectLogo';
import BrandLogo from 'ref/responsive/component/AxisLogo';
import Policy from 'toggle/responsive/page/account/registration/Policy';
import { verifyRecaptcha } from 'shared/service/action/support';
import Recaptcha from 'toggle/responsive/page/auth/recaptcha/Recaptcha';
import RecaptchaDisclaimer from 'toggle/responsive/page/auth/recaptcha/RecaptchaDisclaimer';
import {
	alertModal,
	Providers,
	invalidCredentialModal,
	INVALID_CREDENTIAL_MODAL,
	MAX_ATTEMPTS,
	MEPASS_ALERT_MODAL,
	setLoginSource,
	SSO_ACCOUNT_DISABLED_MSG,
	getSingleSignOnOptions
} from 'toggle/responsive/util/authUtil';
import { formDisplayState } from '../../pageEntry/account/ssoValidationUtil';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { attemptedLoginUser, clearAttemptedLogin } from 'shared/account/profileWorkflow';
import { isLessThanTabletSize, isTabletSize, isPortrait, isMobileLandscape } from 'toggle/responsive/util/grid';
import { bem as meConnectBem } from 'toggle/responsive/component/MeConnect';
import { ssoFormMounted } from 'shared/account/accountWorkflow';
import { get } from 'shared/util/objects';
import { getSignDevice } from 'shared/util/deviceUtil';

import './SignInForm.scss';
import './InvalidCredentialModal.scss';

const bem = new Bem('sign-in-form');

const isMobileView = () => {
	return isLessThanTabletSize() || ((isTabletSize() && isPortrait()) || isMobileLandscape());
};
interface DispatchProps {
	verifyRecaptcha?: (body: api.VerifyRecaptchaRequest) => Promise<any>;
}

interface SignInFormState {
	email: string;
	password: string;
	remember: boolean;
	submitting: boolean;
	submittingFb: boolean;
	submittingGoogle: boolean;
	error: string;
	attempts: number;
	touched: boolean;
	isMobile: boolean;
	isMounted: boolean;
}

interface SignInFormProps {
	getRedirectPath: (defaultPath?: string) => string;
	singleSignOnAnonymous: (options: api.SingleSignOnRequest, redirectPath: string) => Promise<any>;
	location?: any;
}

interface SignInStateProps {
	signInPath: string;
	registerPath: string;
	config: state.Config;
	redirectedPath: string;
}

interface SignInFormDispatchProps {
	mcSSOSignIn: (username: string, password: string, rc: string) => Promise<any>;
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	sendRegisterAnalyticsEvent: () => void;
	attemptedLoginUser: (email: string) => void;
	clearAttemptedLogin: () => void;
	formMounted: (isMounted: boolean) => void;
}

type SignInProps = SignInFormProps & SignInFormDispatchProps & SignInStateProps & DispatchProps;

const errorCodeMap = {
	0: '@{form_signIn_invalid_credentials_msg}',
	2: '@{form_signIn_locked_account_msg}',
	4: '@{form_signIn_invalid_credentials_msg}',
	16: '@{form_session_timeout_msg}',
	400: '@{form_signIn_invalid_parameters_msg}',
	401: '@{form_signIn_invalid_credentials_msg}',
	404: '@{form_sendEmail_error}',
	6000: '@{form_signIn_fb_unknown_error_msg}',
	6001: '@{form_signIn_fb_email_exists_msg}',
	6002: '@{form_signIn_fb_invalid_token_msg}',
	6003: '@{form_signIn_fb_existing_link_msg}',
	6004: '@{form_signIn_fb_no_email_msg}'
};

export class SignInForm extends React.Component<SignInProps, SignInFormState> {
	private resetForm = false;

	static contextTypes: any = {
		router: PropTypes.object.isRequired
	};

	context: {
		router: ReactRouter.InjectedRouter;
	};

	state: SignInFormState = {
		email: '',
		password: '',
		remember: false,
		submittingFb: false,
		submittingGoogle: false,
		submitting: false,
		error: undefined,
		attempts: 0,
		touched: false,
		isMobile: isMobileView(),
		isMounted: false
	};
	componentDidMount() {
		const queryString = getQueryParams(window.location.search);
		this.props.sendRegisterAnalyticsEvent();

		if (queryString) {
			if (queryString.error && queryString['error-status-code'] === 401) {
				this.openSignUpFailedModal();
			} else if (queryString.email) {
				this.setState({ email: typeof queryString.email === 'boolean' ? '' : queryString.email });
			} else if (queryString.token) {
				setIsSocialAccount(true);
				this.onSignInSuccess({ token: queryString.token, isSocialAccount: true });
			}
		}
		window.addEventListener('resize', this.onResize, false);
		this.setState({ isMounted: true }, () => this.props.formMounted(true));
	}

	componentWillUnmount() {
		this.loadComplete();
		window.removeEventListener('resize', this.onResize);
		this.setState({ isMounted: false }, () => this.props.formMounted(false));
	}

	private loadComplete = () => {
		const { isMounted } = this.state;
		isMounted && this.setState({ submitting: false, submittingFb: false, submittingGoogle: false, isMounted: false });
	};

	private validateInput = (inputValue: string): { displayState: formDisplayState; message: string } => {
		const { submitting, submittingFb, submittingGoogle, error, touched } = this.state;
		if (error) {
			return { displayState: formDisplayState.ERROR, message: error };
		}
		if (touched && !inputValue) {
			return { displayState: formDisplayState.ERROR, message: '@{empty_required_error|This is required}' };
		}
		if (submitting || submittingFb || submittingGoogle) {
			return { displayState: formDisplayState.DISABLED, message: '' };
		}
		return { displayState: formDisplayState.DEFAULT, message: '' };
	};

	private signInError = e => {
		const { isMounted } = this.state;
		if (!isMounted) return;
		if (_DEV_) console.warn('Sign in failed', e);

		let msg = (e && (errorCodeMap[e.code || e.status] || e.message)) || errorCodeMap[0];
		if (this.state.attempts === MAX_ATTEMPTS) {
			this.openModal(invalidCredentialModal());
		}

		let theRest = {};
		// login attempt for both disabled account and wrong credentials returns 401
		if (e.status === 401) {
			if (e.error.indexOf(SSO_ACCOUNT_DISABLED_MSG) > -1) {
				this.openModal(alertModal(e.error, '@{me_connect_modal_header|meconnect Account}'));
			} else if (get(e, 'account_status') === 'Deleted') {
				this.openModal(
					alertModal('@{me_connect_deleted_account_description}', '@{me_connect_deleted_account|Account Deleted}')
				);
				theRest = { ...theRest, email: '', touched: false };
				this.resetForm = true;
				msg = undefined;
			}
		}

		if (e && e.code === 16) {
			this.openModal(alertModal('@{form_session_timeout_msg}', '@{me_connect_session_timeout|Session Timeout}'));
			msg = undefined;
		}

		// meant for server Response 5XX or network failed request
		if (
			e &&
			((e.code || e.status) >= 500 ||
				(e.message && ['error', 'failed'].some(keyword => e.message.toLowerCase().indexOf(keyword) > -1)))
		) {
			this.openModal(alertModal('@{form_signIn_failed}', '@{me_connect_modal_header|meconnect Account}'));
			msg = undefined;
		}

		this.setState(prevState => {
			return {
				...theRest,
				submittingGoogle: false,
				submittingFb: false,
				submitting: false,
				error: msg,
				attempts: prevState.attempts + 1
			};
		});
	};

	private openModal = (props = invalidCredentialModal()) => {
		this.props.showModal({
			id: INVALID_CREDENTIAL_MODAL,
			type: ModalTypes.MEPASS_DIALOG,
			componentProps: props,
			onClose: this.onModalClose
		});
	};

	private openSignUpFailedModal = () => {
		const componentProps = alertModal('@{form_signIn_failed}', '@{me_connect_modal_header|meconnect Account}');
		this.props.showModal({
			id: MEPASS_ALERT_MODAL,
			type: ModalTypes.MEPASS_DIALOG,
			componentProps
		});
	};

	private onModalClose = () => {
		this.setState({ attempts: 0 });
		this.props.closeModal(INVALID_CREDENTIAL_MODAL);
	};

	private recaptchaCallback = (token: string) => {
		window.grecaptcha.reset();
		const { email, password, submitting } = this.state;
		if (!email || !password) return;

		this.setState({ submitting: true });
		!submitting &&
			this.props.mcSSOSignIn(email, password, token).then(response => {
				if (response.error) {
					this.signInError(response.payload);
					const { attemptedLoginUser } = this.props;
					attemptedLoginUser(email);
					this.setState({ submitting: false });
				} else {
					setLoginSource(Providers.MEDIACORP);
					this.onSignInSuccess({ ...response.payload, isSocialAccount: false });
				}
			});
	};

	private onSubmit = e => {
		e.preventDefault();
		const { email, password, submitting } = this.state;
		this.setState({ error: undefined, touched: true });
		if (!email || !password || submitting) return;
		window.grecaptcha.execute();
	};

	// after successful mediaCorp SSO, sign in the user with axis
	private onSignInSuccess = ({ token, isSocialAccount }) => {
		const { singleSignOnAnonymous, config, redirectedPath } = this.props;
		const queryString = getQueryParams(window.location.search) || {};
		const { redirect, ...params } = queryString;
		delete params.token;

		const path = redirect || redirectedPath;
		const subscriptionPagePath = getSubscriptionPagePath(config);
		if (!path.includes(subscriptionPagePath)) {
			params.coldStartPath = getPathByKey(ColdStart, config);
		}
		const options = getSingleSignOnOptions();
		singleSignOnAnonymous(
			{
				...options,
				token
			},
			addQueryParameterToURL(path, params)
		)
			.then(() => {
				this.loadComplete();
				const { clearAttemptedLogin } = this.props;
				clearAttemptedLogin();
			})
			.catch(e => {
				if (isSocialAccount) {
					removeIsSocialAccount();
				}
				setLoginSource(Providers.NA);
				this.signInError(e);
			});
	};

	private onTextChange = e => {
		this.resetForm = false;
		const newState = { error: undefined };
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	};

	private onReference = node => {
		// need to wait for autofill to occur before setting focus otherwise it
		// blocks the onchange event.
		const { isMounted } = this.state;
		if (node) {
			setTimeout(() => {
				if (!isMounted) return;
				window.focus();
				node.focus();
				node.select();
				// Additional keypress to make sure that the cursor is at the end
				// as well as making sure that autofill styling doesn not persist
				node.dispatchEvent(
					new KeyboardEvent('keypress', {
						key: 'ArrowRight'
					})
				);
			}, 200);
		}
	};

	private onResize = () => {
		this.setState({ isMobile: isMobileView() });
	};

	renderForm() {
		return (
			<div>
				<div className={bem.e('logo')}>
					<MeConnectLogo height={49} width={195} />
				</div>

				<div className={bem.e('header')}>
					<IntlFormatter className={bem.e('header__signin-message')}>
						{'@{form_signIn_me_connect_message|You are signing in to}'}
					</IntlFormatter>
					<div className={bem.e('header__vertical-line')} />
					<BrandLogo fillColor="#F900E4" width="122px" height="38px" />
				</div>
				{this.renderSigninForm()}
			</div>
		);
	}
	renderSigninForm() {
		const { submittingFb, submittingGoogle, email, password } = this.state;
		const { displayState: displayStateEmail, message: messageEmail } = this.validateInput(email);
		const { displayState: displayStatePassword, message: messagePassword } = this.validateInput(password);

		const pwProps = this.resetForm ? { value: '' } : {};
		const userNameProps = this.resetForm ? { focus: true } : {};

		return (
			<div>
				<form className={bem.e('form')} onSubmit={this.onSubmit} noValidate={true}>
					<TextInput
						type={'email'}
						displayState={displayStateEmail}
						required={true}
						name={'email'}
						label={'@{form_signIn_email_label|Email}'}
						id={'email'}
						autoComplete="off"
						onChange={this.onTextChange}
						onReference={this.onReference}
						value={email}
						mePass={true}
						showEmailIcon={true}
						message={messageEmail}
						autoFocus
						{...userNameProps}
					/>

					<PasswordInput
						type={'password'}
						displayState={displayStatePassword}
						name={'password'}
						label={'@{form_signIn_password_label|Password}'}
						id={'password'}
						autoComplete="off"
						onChange={this.onTextChange}
						mePass={true}
						showPasswordIcon={true}
						message={messagePassword}
						{...pwProps}
					/>
					<IntlFormatter elementType="div" className={meConnectBem.e('advisory-header')}>
						{'@{form_advisory_password_header}'}
						<IntlFormatter elementType="ul">
							<IntlFormatter elementType="li" className={meConnectBem.e('advisory-text')}>
								{'@{form_advisory_password_text1}'}
							</IntlFormatter>
							<IntlFormatter elementType="li" className={meConnectBem.e('advisory-text')}>
								{'@{form_advisory_password_text2}'}
							</IntlFormatter>
							<IntlFormatter elementType="li" className={meConnectBem.e('advisory-text')}>
								{'@{form_advisory_password_text3}'}
							</IntlFormatter>
						</IntlFormatter>
					</IntlFormatter>
					<div className={bem.e('primary-action')}>
						<IntlFormatter
							elementType={CtaButton}
							componentProps={{
								type: 'submit',
								ordinal: 'primary',
								theme: 'blue',
								disabled: submittingFb || submittingGoogle,
								large: true,
								mePass: true
							}}
						>
							{'@{form_signIn_signInButton_label|SIGN IN}'}
						</IntlFormatter>
					</div>
				</form>
				<RecaptchaDisclaimer />
				<div className={cx(bem.e('secondary-actions'), 'clearfix')}>
					<IntlFormatter
						elementType={Link}
						className={cx(bem.e('forgot-pwd'), 'link')}
						componentProps={{ to: `@${ResetPassword}` }}
					>
						{'@{form_signIn_forgotPassword_label|Forgot Password?}'}
					</IntlFormatter>
				</div>
			</div>
		);
	}

	renderMobileMeConnectSignIn() {
		return (
			<div className={bem.e('mobile')}>
				<div className={bem.e('mobile-cta')}>
					<div className={bem.e('header')}>
						<IntlFormatter className={bem.e('header__signin-message')}>
							{'@{form_signIn_me_connect_message|You are signing in to}'}
						</IntlFormatter>
						<div className={bem.e('header__vertical-line')} />
						<BrandLogo fillColor="#F900E4" width="122px" height="38px" />
					</div>
					<IntlFormatter className={bem.e('signin-via')}>via</IntlFormatter>
					<div className={bem.e('signin-container')}>
						<div className={bem.e('logo')}>
							<MeConnectLogo height={32} width={127} />
						</div>

						<IntlFormatter elementType="div" className={meConnectBem.e('description')}>
							{'@{me_connect_description_mobile}'}
						</IntlFormatter>

						{this.renderSigninForm()}
					</div>
				</div>
			</div>
		);
	}

	renderDesktopMeConnectSign() {
		return <div className={bem.e('desktop')}>{this.renderForm()}</div>;
	}

	render() {
		const redirectPath = this.props.getRedirectPath();
		const { isMounted } = this.state;
		return (
			isMounted && (
				<div className={bem.b()}>
					{this.renderMobileMeConnectSignIn()}
					{this.renderDesktopMeConnectSign()}
					<Recaptcha
						id="signin"
						siteKey={process.env.CLIENT_RECAPTCHA_INVISIBLE_SITE_KEY}
						dataSize="invisible"
						callback={this.recaptchaCallback}
					/>
					<div className="divider">
						<IntlFormatter>{'@{form_signIn_divider|OR}'}</IntlFormatter>
					</div>
					<div className={cx(bem.e('terms'), 'clearfix')}>
						<IntlFormatter elementType={'span'} className={cx(bem.e('terms-text'))}>
							{
								'@{form_signIn_terms_1|The products or services provided are not intended for persons residing in the EU. By signing in using social media account(s), you represent that you have read, and agree to, our }'
							}
						</IntlFormatter>
						<Policy pageKey={TermsAndConditions} label={'@{form_register_terms_of_service|terms}'} />
						&nbsp;
						<IntlFormatter elementType={'span'} className={cx(bem.e('terms-text'))}>
							{'@{form_signIn_and_label| and}'}
						</IntlFormatter>
						&nbsp;
						<Policy pageKey={Privacy} label={'@{form_register_privacy_policy|privacy policy}'} />
						&nbsp;
						<IntlFormatter elementType={'span'} className={cx(bem.e('terms-text'))}>
							{'@{form_signIn_terms_2|For first time users, a new meconnect account will be created.}'}
						</IntlFormatter>
					</div>
					{this.renderAppleButton(redirectPath)}
					{this.renderFacebookButton(redirectPath, this.state)}
					{this.renderGoogleButton(redirectPath, this.state)}

					<div className={bem.e('tertiary-actions')}>
						<IntlFormatter>{'@{me_connect_no_account}'}</IntlFormatter>
						<IntlFormatter
							elementType={CtaButton}
							className={cx(bem.e('register'), 'link')}
							onClick={() => this.onRegister(redirectPath)}
							componentProps={{
								mePass: true,
								ordinal: 'primary',
								large: true
							}}
						>
							{'@{form_signIn_createAccount_label|CREATE ONE NEW}'}
						</IntlFormatter>
					</div>
				</div>
			)
		);
	}

	private onRegister = redirectPath => {
		if (redirectPath) setRedirectPathAfterSignin(redirectPath);
		browserHistory.push(this.props.registerPath);
	};

	private redirectSocialLogin = (socialLoginProvider: Providers, redirectPath: string) => {
		const { id, os, browser } = getSignDevice(true);
		const socialLoginType = socialLoginProvider.toLowerCase();
		setLoginSource(socialLoginProvider);
		window.location.href = `/mc-sso-register/${socialLoginType}/${id}?redirectpath=${redirectPath}&os=${os}&browser=${browser}`;
	};

	private renderFacebookButton(goBackToPage, { submitting, submittingFb, submittingGoogle }: SignInFormState) {
		const redirectPath = encodeURIComponent(`/${this.props.signInPath}?redirect=${goBackToPage}`);

		return (
			<div className={bem.e('primary-action')}>
				<CtaButton
					ordinal="secondary"
					disabled={submitting || submittingGoogle}
					className="facebook-button"
					large
					mePass={true}
					onClick={() => this.redirectSocialLogin(Providers.FACEBOOK, redirectPath)}
				>
					<FacebookIcon width={22} height={22} className="facebook-icon" />
					<IntlFormatter className={bem.e('text')}>
						{'@{form_signIn_facebookButton_label|Continue with Facebook}'}
					</IntlFormatter>
				</CtaButton>
			</div>
		);
	}

	private renderGoogleButton(goBackToPage, { submitting, submittingFb, submittingGoogle }: SignInFormState) {
		const redirectPath = encodeURIComponent(`/${this.props.signInPath}?redirect=${goBackToPage}`);

		return (
			<div className={bem.e('primary-action')}>
				<CtaButton
					ordinal="secondary"
					disabled={submitting || submittingFb}
					className="google-button"
					mePass={true}
					large
					onClick={() => this.redirectSocialLogin(Providers.GOOGLE, redirectPath)}
				>
					<div className="google-icon" />
					<IntlFormatter className={bem.e('text')}>
						{'@{form_signIn_googleButton_label|Continue with Google}'}
					</IntlFormatter>
				</CtaButton>
			</div>
		);
	}

	private renderAppleButton(goBackToPage) {
		const redirectPath = encodeURIComponent(`/${this.props.signInPath}?redirect=${goBackToPage}`);

		return (
			<div className={bem.e('primary-action')}>
				<CtaButton
					ordinal="secondary"
					className="apple-button"
					large
					mePass={true}
					onClick={() => this.redirectSocialLogin(Providers.APPLE, redirectPath)}
				>
					<AppleIcon width={22} height={22} className="apple-icon" />
					<IntlFormatter className={bem.e('text')}>
						{'@{form_signIn_appleButton_label|Continue with Apple}'}
					</IntlFormatter>
				</CtaButton>
			</div>
		);
	}
}
function mapDispatchToProps(dispatch) {
	return {
		mcSSOSignIn: (email, password, rc: string) => dispatch(mcSSOSignIn(email, password, rc)),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		sendRegisterAnalyticsEvent: () => dispatch(pageAnalyticsEvent(window.location.pathname)),
		attemptedLoginUser: (email: string) => dispatch(attemptedLoginUser(email)),
		clearAttemptedLogin: () => dispatch(clearAttemptedLogin()),
		formMounted: isMounted => dispatch(ssoFormMounted(isMounted)),
		verifyRecaptcha: (body: api.VerifyRecaptchaRequest) => dispatch(verifyRecaptcha(body))
	};
}

function mapStateToProps({ app }: state.Root, ownProps: SignInFormProps) {
	return {
		signInPath: getSignInPath(app.config),
		registerPath: getPathByKey(Register, app.config),
		config: app.config,
		redirectedPath: ownProps.getRedirectPath()
	};
}

export default connect<SignInStateProps, SignInFormDispatchProps, SignInProps>(
	mapStateToProps,
	mapDispatchToProps
)(SignInForm);
