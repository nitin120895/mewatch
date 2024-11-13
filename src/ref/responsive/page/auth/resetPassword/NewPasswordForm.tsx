import * as React from 'react';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import PasswordInput from 'ref/responsive/component/input/PasswordInput';
import TextInput from 'ref/responsive/component/input/TextInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ResetPassword as PageKey } from 'shared/page/pageKey';

const bem = new Bem('reset-password-forms');

interface NewPasswordFormState {
	submitted: boolean;
	password: string;
	email: string;
	loading: boolean;
	inputState: form.DisplayState;
	errorCode: number;
}

interface NewPasswordFormProps {
	newPassword: (email: string, password: string, token: string) => Promise<api.Response<any>>;
	token: string;
}

export default class NewPasswordForm extends React.Component<NewPasswordFormProps, NewPasswordFormState> {
	constructor(props) {
		super(props);
		this.state = {
			submitted: false,
			password: '',
			email: '',
			loading: false,
			inputState: 'default',
			errorCode: undefined
		};
	}

	private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			[e.target.name]: e.target.value,
			inputState: 'default',
			errorCode: undefined
		} as any);
	};

	private onResponse = response => {
		const { error, data } = response;
		if (error) {
			this.setState({
				loading: false,
				inputState: 'error',
				errorCode: data.body.code
			});
		} else {
			this.setState({
				loading: false,
				submitted: true,
				inputState: 'default'
			});
		}
	};

	private onSubmit = e => {
		e.preventDefault();
		const { newPassword, token } = this.props;
		const { email, password } = this.state;
		this.setState({ loading: true, inputState: 'disabled' });
		newPassword(email, password, token).then(this.onResponse);
	};

	render() {
		const { submitted } = this.state;
		return (
			<div className={bem.b()}>{(submitted && this.renderPasswordUpdated()) || this.renderEnterNewPassword()}</div>
		);
	}

	private renderEnterNewPassword() {
		const { loading, inputState, errorCode } = this.state;
		return (
			<form onSubmit={this.onSubmit}>
				{inputState === 'error' && this.renderError(errorCode)}
				<IntlFormatter elementType={'h2'} className={bem.e('title')}>
					{'@{form_newPassword_step1_title|Password Reset}'}
				</IntlFormatter>
				<TextInput
					type={'email'}
					label={'@{form_newPassword_step1_email_label|Email}'}
					id={'email'}
					name={'email'}
					displayState={inputState}
					required={true}
					onChange={this.onChange}
					className={bem.e('input')}
				/>
				<PasswordInput
					label={'@{form_newPassword_step1_password_label|Password}'}
					id={'password'}
					name={'password'}
					displayState={inputState}
					onChange={this.onChange}
					message={"@{form_newPassword_step2_passwordRequirements|Your password isn't strong enough.}"}
					className={bem.e('input')}
				/>
				<AccountButton
					disabled={inputState === 'disabled'}
					type={'submit'}
					theme="blue"
					className={bem.e('submit')}
					loading={loading}
					large
				>
					<IntlFormatter>{'@{form_newPassword_step1_saveButton_label|Save}'}</IntlFormatter>
				</AccountButton>
			</form>
		);
	}

	private renderPasswordUpdated() {
		return (
			<div>
				<IntlFormatter elementType={'h2'} className={bem.e('title')}>
					{'@{form_newPassword_step2_title|New Password Saved}'}
				</IntlFormatter>
				<IntlFormatter elementType={'p'} className={bem.e('content')}>
					{'@{form_newPassword_step2_info|Your password has been updated.}'}
				</IntlFormatter>
				<div className={bem.e('bottom-link')}>
					<Link to="/signin">
						<AccountButton large className={bem.e('submit')} theme="blue" type="submit" focusable={false}>
							<IntlFormatter>{'@{form_auth_back_link|Go to Sign In Page}'}</IntlFormatter>
						</AccountButton>
					</Link>
				</div>
			</div>
		);
	}

	private renderError(errorCode) {
		const { email } = this.state;
		const defaultError = (
			<IntlFormatter tagName="p" className="pg-auth-error">
				{'@{form_newPassword_step1_error_validation|Reset password error.}'}
			</IntlFormatter>
		);
		return {
			[0]: defaultError,
			[1]: (
				<p className="pg-auth-error">
					<IntlFormatter>{'@{form_newPassword_step1_error_tokenExpired_message|This link has expired}'}</IntlFormatter>
					<br />
					<IntlFormatter elementType={Link} componentProps={{ to: `@${PageKey}?email=${email}`, className: 'link' }}>
						{'@{form_newPassword_step1_error_tokenExpired_link|Send again}'}
					</IntlFormatter>
				</p>
			),
			[4]: defaultError
		}[errorCode];
	}
}
