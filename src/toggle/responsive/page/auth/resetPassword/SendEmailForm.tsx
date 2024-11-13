import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import TextInput from 'ref/responsive/component/input/TextInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import { SignIn } from 'shared/page/pageKey';
import Link from 'shared/component/Link';
import { formDisplayState } from '../../../pageEntry/account/ssoValidationUtil';
import { clearAttemptedLogin } from 'shared/account/profileWorkflow';
import { get } from 'shared/util/objects';
import { KEY_CODE } from 'shared/util/keycodes';
import { ssoFormMounted } from 'shared/account/accountWorkflow';
import { verifyRecaptcha } from 'shared/service/action/support';
import Recaptcha from 'toggle/responsive/page/auth/recaptcha/Recaptcha';
import '../ResetPasswordModals.scss';

const bem = new Bem('reset-password-forms');
interface SendEmailFormOwnProps {
	email?: string;
	sendResetEmail: (email: string) => Promise<any>;
}
interface VerifyRecaptchaDispatchProps {
	verifyRecaptcha?: (body: api.VerifyRecaptchaRequest) => Promise<any>;
}

interface SendEmailFormDispatchProps {
	clearAttemptedLogin: () => void;
	formMounted: (isMounted: boolean) => void;
}

interface SendEmailFormState {
	emailAddress: string;
	inputState: form.DisplayState;
	error: boolean;
	errorMessage?: string;
	responseStatus?: number;
	recaptchaChecked?: boolean;
	submitted: boolean;
	isMounted: boolean;
}

type SendEmailFormProps = SendEmailFormOwnProps & SendEmailFormDispatchProps & VerifyRecaptchaDispatchProps;

class SendEmailForm extends React.Component<SendEmailFormProps, SendEmailFormState> {
	constructor(props) {
		super(props);
		this.state = {
			emailAddress: props.email || undefined,
			inputState: formDisplayState.DEFAULT,
			error: false,
			recaptchaChecked: false,
			submitted: false,
			isMounted: false
		};
	}

	private emailRed = undefined;

	componentDidMount() {
		if (this.emailRed) {
			setTimeout(() => {
				window.focus();
				this.emailRed.focus();
			}, 200);
		}
		this.setState({ isMounted: true }, () => this.props.formMounted(true));
	}

	componentWillUnmount() {
		this.props.formMounted(false);
		this.setState({ isMounted: false }, () => this.props.formMounted(false));
	}

	private onChange = e => this.setState({ emailAddress: e.target.value });

	private handleKeyDown = event => {
		const { emailAddress, recaptchaChecked } = this.state;
		const isValidForm = emailAddress && recaptchaChecked;

		if (event.keyCode === KEY_CODE.ENTER && !isValidForm) {
			event.preventDefault();
		}
	};

	private onFocus = () => {
		this.setState({
			error: false,
			errorMessage: undefined,
			inputState: formDisplayState.DEFAULT
		});
	};

	private onResponse = (response: api.Response<any>) => {
		const error = response.error;
		const errorMessage = get(response, 'payload.message');
		const responseStatus = get(response, 'payload.status');
		const { clearAttemptedLogin } = this.props;
		this.setState(
			{
				error,
				errorMessage,
				responseStatus,
				inputState: formDisplayState.DEFAULT,
				submitted: true
			},
			() => {
				if (!this.state.error) {
					clearAttemptedLogin();
				}
			}
		);
	};

	private recaptchaCallback = token => {
		const { verifyRecaptcha } = this.props;
		verifyRecaptcha({
			response: token,
			type: 1
		}).then(res => {
			if (res.payload.success) {
				this.setState({ recaptchaChecked: true });
			} else {
				this.setState({ recaptchaChecked: false });
			}
		});
	};

	private onSubmit = e => {
		e.preventDefault();
		const { sendResetEmail } = this.props;

		this.setState({ inputState: formDisplayState.DISABLED, recaptchaChecked: false });

		sendResetEmail(this.state.emailAddress).then(this.onResponse);
		window.grecaptcha.reset();
	};

	// copied from SignInForm to set focus on first input, workaround for ipad landscape
	// when focus on first element triggered keyboard and it made button feel like it was hovered
	private onReference = node => {
		this.emailRed = node;
	};

	render() {
		const { inputState, emailAddress, recaptchaChecked, submitted, isMounted } = this.state;
		const disabled =
			inputState === formDisplayState.ERROR ||
			inputState === formDisplayState.DISABLED ||
			!emailAddress ||
			!recaptchaChecked;

		if (!isMounted) {
			// tslint:disable-next-line: no-null-keyword
			return null;
		}

		return (
			<div className={bem.b()}>
				<form onSubmit={this.onSubmit}>
					<div className={bem.e('top-link')}>
						<Link to={`@${SignIn}`} className={'link'}>
							<IntlFormatter>{'@{form_sendEmail_step1_back|Back to Sign In?}'}</IntlFormatter>
						</Link>
					</div>
					<IntlFormatter className={bem.e('title')} elementType="h2">
						{'@{form_sendEmail_step1_title|Forgot your password?}'}
					</IntlFormatter>
					<IntlFormatter className={bem.e('content')} elementType="p">
						{'@{form_sendEmail_step1_info|Please enter your email address and we’ll send you a link to reset it}'}
					</IntlFormatter>
					<TextInput
						type="email"
						value={emailAddress}
						displayState={inputState}
						onChange={this.onChange}
						onKeyDown={this.handleKeyDown}
						onReference={this.onReference}
						required={true}
						onFocus={this.onFocus}
						name="email"
						label={'@{form_sendEmail_step1_email_label|Email}'}
						id="email"
						autoComplete="off"
						oskType="email"
						className={bem.e('input')}
						mePass
					/>
					<Recaptcha
						id="forgetPassword"
						callback={this.recaptchaCallback}
						siteKey={process.env.CLIENT_RECAPTCHA_CHECKBOX_SITE_KEY}
						dataType="image"
					/>
					<CtaButton
						ordinal="primary"
						disabled={disabled}
						type="submit"
						className={cx(bem.e('submit'), { error: inputState === formDisplayState.ERROR })}
						large
						mePass
					>
						<IntlFormatter>{'@{form_sendEmail_step1_submit_label|Submit}'}</IntlFormatter>
					</CtaButton>
					{submitted && (
						<IntlFormatter elementType={'p'} className={bem.e('message')}>
							{
								'@{form_sendEmail_message|If an account associated with the provided email address exists, an email containing instructions on how to reset the password would be sent.}'
							}
						</IntlFormatter>
					)}
				</form>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		clearAttemptedLogin: () => dispatch(clearAttemptedLogin()),
		formMounted: isMounted => dispatch(ssoFormMounted(isMounted)),
		verifyRecaptcha: (body: api.VerifyRecaptchaRequest) => dispatch(verifyRecaptcha(body))
	};
}

function mapStateToProps({ profile }: state.Root, ownProps) {
	return {
		email: profile.attemptedLoginUserName
	};
}

export default connect<{}, SendEmailFormDispatchProps, SendEmailFormOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(SendEmailForm);
