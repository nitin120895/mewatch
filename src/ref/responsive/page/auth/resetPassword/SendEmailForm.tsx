import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { SignIn } from 'shared/page/pageKey';
import Link from 'shared/component/Link';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import TextInput from 'ref/responsive/component/input/TextInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

const bem = new Bem('reset-password-forms');

interface SendEmailFormProps {
	email?: string;
	sendResetEmail: (body: { email: string }) => Promise<any>;
}

interface SendEmailFormState {
	submitted: boolean;
	emailAddress: string;
	loading: boolean;
	inputState: form.DisplayState;
}

export default class SendEmailForm extends React.Component<SendEmailFormProps, SendEmailFormState> {
	constructor(props) {
		super(props);
		this.state = {
			submitted: false,
			emailAddress: props.email || undefined,
			loading: false,
			inputState: 'default'
		};
	}

	private onChange = e => this.setState({ emailAddress: e.target.value });
	private onResponse = () => this.setState({ loading: false, submitted: true });

	private onSubmit = e => {
		e.preventDefault();
		const { sendResetEmail } = this.props;
		this.setState({ loading: true, inputState: 'disabled' });

		sendResetEmail({
			email: this.state.emailAddress
		}).then(this.onResponse);
	};

	render() {
		const { submitted } = this.state;
		return <div className={bem.b()}>{(submitted && this.renderEmailSent()) || this.renderForgotPwdForm()}</div>;
	}

	private renderForgotPwdForm() {
		const { loading, inputState, emailAddress } = this.state;
		return (
			<form onSubmit={this.onSubmit}>
				<IntlFormatter className={bem.e('title')} elementType={'h2'}>
					{'@{form_sendEmail_step1_title|Forgot Password}'}
				</IntlFormatter>
				<IntlFormatter className={bem.e('content')} elementType={'p'}>
					{'@{form_sendEmail_step1_info|Enter email address below for a reset link.}'}
				</IntlFormatter>
				<TextInput
					type={'email'}
					value={emailAddress}
					displayState={inputState}
					onChange={this.onChange}
					required={true}
					name={'email'}
					label={'@{form_sendEmail_step1_email_label|Email address}'}
					id={'email'}
					oskType={'email'}
					className={bem.e('input')}
				/>
				<AccountButton
					disabled={inputState === 'disabled'}
					type="submit"
					loading={loading}
					theme="blue"
					className={bem.e('submit')}
					large
				>
					<IntlFormatter>{'@{form_sendEmail_step1_submit_label|Send Link}'}</IntlFormatter>
				</AccountButton>
				<div className={bem.e('bottom-link')}>
					<Link to={`@${SignIn}`} className={'link'}>
						<IntlFormatter>{'@{form_auth_back_link|Go to Sign In Page}'}</IntlFormatter>
					</Link>
				</div>
			</form>
		);
	}

	private renderEmailSent() {
		const { emailAddress } = this.state;
		return (
			<div>
				<IntlFormatter elementType={'h2'} className={bem.e('title')}>
					{'@{form_sendEmail_step2_title|Email sent}'}
				</IntlFormatter>
				<IntlFormatter elementType={'p'} className={bem.e('content')} values={{ emailAddress }}>
					{'@{form_sendEmail_step2_info|Please check your inbox for a reset link.}'}
				</IntlFormatter>
				<div className={bem.e('bottom-link')}>
					<Link to={`@${SignIn}`}>
						<AccountButton className={bem.e('submit')} theme="blue" type="submit" focusable={false} large>
							<IntlFormatter>{'@{form_auth_back_link|Go to Sign In Page}'}</IntlFormatter>
						</AccountButton>
					</Link>
				</div>
			</div>
		);
	}
}
