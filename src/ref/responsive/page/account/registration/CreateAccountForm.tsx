import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import TextInput from 'ref/responsive/component/input/TextInput';
import PasswordInput from 'ref/responsive/component/input/PasswordInput';
import Checkbox from 'ref/responsive/component/input/Checkbox';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import { register as registerAction } from 'shared/service/action/registration';
import { autoSignIn } from 'shared/account/sessionWorkflow';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import { Home as homePageKey } from 'shared/page/pageKey';
import { makeCancelable, CancelablePromise } from 'shared/util/promises';
import { registrationStart, registrationComplete, registrationCancel } from 'shared/account/accountWorkflow';

import './CreateAccountForm.scss';

const bem = new Bem('register-form');

interface CreateAccountFormFields {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	termsCondition: boolean;
	pin?: string;
	marketing?: boolean;
}

interface CreateAccountState extends CreateAccountFormFields {
	registered: boolean;
	error: string;
	loading: boolean;
}

interface StateProps {
	isLoggedIn: boolean;
}

interface DispatchProps {
	registerAction: (formData: api.RegistrationRequestOmited) => Promise<api.Response<api.AccessToken[]>>;
	autoSignIn: () => void;
	registrationStart: (plan?: api.Plan) => void;
	registrationComplete: (plan?: api.Plan) => void;
	registrationCancel: (plan?: api.Plan) => void;
}

interface CreateAccountOwnProps {
	plan: api.Plan | undefined;
}

type CreateAccountProps = StateProps & DispatchProps & CreateAccountOwnProps;

class CreateAccountForm extends React.Component<CreateAccountProps, CreateAccountState> {
	private pendingRequest: CancelablePromise<any>;

	constructor(props: CreateAccountProps) {
		super(props);

		this.state = {
			email: '',
			password: '',
			firstName: '',
			lastName: '',
			pin: '',
			marketing: false,
			registered: props.isLoggedIn, // show welcome to signed-in user
			error: undefined,
			loading: false,
			termsCondition: false
		};
	}

	componentDidMount() {
		const { isLoggedIn, registrationStart, plan } = this.props;
		if (!isLoggedIn) registrationStart(plan);
	}

	componentWillUnmount() {
		if (this.pendingRequest) {
			this.pendingRequest.cancel();
			this.pendingRequest = undefined;
		}
		const { isLoggedIn, registrationCancel, plan } = this.props;
		if (!isLoggedIn) registrationCancel(plan);
	}

	private onSubmit = e => {
		e.preventDefault();
		this.setState({
			loading: true,
			error: undefined
		});

		const formData = this.getFormData();
		this.createAccount(formData);
	};

	private getFormData(): CreateAccountFormFields {
		const { email, password, firstName, lastName, pin, marketing } = this.state;
		const formData: CreateAccountFormFields = {
			email,
			password,
			firstName,
			lastName,
			marketing,
			termsCondition: false
		};
		// Don't submit a pin unless it's valid
		if (pin.length === 4) formData.pin = pin;
		return formData;
	}

	private createAccount(formData: CreateAccountFormFields) {
		this.pendingRequest = makeCancelable(this.props.registerAction(formData));
		this.pendingRequest.promise
			.then(res => {
				if (res.error) this.createAccountFailed('form_register_error_message');
				else this.createAccountSucceeded();
				this.pendingRequest = undefined;
			})
			.catch(e => {
				// either the API failed
				// or the promise was cancelled
				if (this.pendingRequest) this.createAccountFailed('form_register_error_message');
				this.pendingRequest = undefined;
			});
	}

	private createAccountFailed(error: string) {
		this.setState({
			error,
			loading: false
		});
	}

	private createAccountSucceeded() {
		const { autoSignIn, registrationComplete, plan } = this.props;
		autoSignIn();
		registrationComplete(plan);

		this.setState({
			loading: false,
			registered: true
		});
	}

	private onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ [e.target.name]: e.target.value } as any);
	};

	private onCheckBoxChange = e => {
		this.setState((previousState, currentProps) => {
			return { marketing: !previousState.marketing };
		});
	};

	private displayState = () => {
		const { loading, error } = this.state;
		if (error) return 'error';
		if (loading) return 'disabled';
		else return 'default';
	};

	render() {
		if (this.state.registered) return this.renderWelcome();
		return this.renderForm();
	}

	private renderWelcome() {
		return (
			<div className={cx('form', 'form-white', bem.b(), 'txt-center')}>
				<IntlFormatter tagName="h2" className="form-title">
					{'@{form_register_welcome_title|Welcome}'}
				</IntlFormatter>
				<IntlFormatter tagName="p">{"@{form_register_welcome_message|You're ready to go!}"}</IntlFormatter>
				<div className={bem.e('primary-action')}>
					<Link to={`@${homePageKey}`}>
						<IntlFormatter
							elementType={AccountButton}
							type="submit"
							componentProps={{
								ordinal: 'primary',
								theme: 'light',
								large: true
							}}
						>
							{'@{form_register_watch_label|Go Home}'}
						</IntlFormatter>
					</Link>
				</div>
			</div>
		);
	}

	private renderForm() {
		const { loading, error, email, password, firstName, lastName, pin, marketing } = this.state;
		const displayState = this.displayState();
		return (
			<div className={cx('form', 'form-white', bem.b())}>
				<IntlFormatter tagName="h2" className="form-title">
					{'@{form_register_title|Create Account}'}
				</IntlFormatter>
				{displayState === 'error' && (
					<IntlFormatter tagName="p" className={bem.e('error')}>
						{`@{${error}|Registration Error}`}
					</IntlFormatter>
				)}
				<form onSubmit={this.onSubmit}>
					<div className={bem.e('name-container')}>
						<TextInput
							type="text"
							displayState={displayState}
							required={true}
							name="firstName"
							label={'@{form_register_firstName_label|First Name}'}
							id="firstName"
							disabled={loading}
							onChange={this.onTextChange}
							value={firstName}
						/>
						<TextInput
							type="text"
							displayState={displayState}
							required={true}
							name="lastName"
							label={'@{form_register_lastName_label|Last Name}'}
							id="lastName"
							disabled={loading}
							onChange={this.onTextChange}
							value={lastName}
						/>
					</div>
					<TextInput
						type={'email'}
						displayState={displayState}
						required={true}
						name={'email'}
						label={'@{form_register_email_label|Email}'}
						id={'email'}
						disabled={loading}
						onChange={this.onTextChange}
						value={email}
					/>
					<PasswordInput
						type={'password'}
						displayState={displayState}
						name={'password'}
						label={'@{form_register_password_label|Password}'}
						disabled={loading}
						id={'password'}
						onChange={this.onTextChange}
						value={password}
					/>

					<TextInput
						type="number"
						displayState={displayState}
						name="pin"
						label={'@{form_register_pin_label|PIN}'}
						id="pin"
						disabled={loading}
						onChange={this.onTextChange}
						value={pin}
					/>
					<Checkbox
						label={'@{form_register_checkbox_label|Please send me email marketing}'}
						name={'marketing'}
						checked={marketing}
						disabled={loading}
						className={bem.e('marketing')}
						onChange={this.onCheckBoxChange}
					/>
					<div className={bem.e('primary-action')}>
						<IntlFormatter
							elementType={AccountButton}
							type="submit"
							componentProps={{
								ordinal: 'primary',
								theme: 'light',
								large: true,
								loading
							}}
						>
							{'@{form_register_button_label|Register}'}
						</IntlFormatter>
					</div>
				</form>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	return {
		isLoggedIn: state.account.active
	};
}

function mapDispatchToProps(dispatch) {
	return {
		registerAction: formData => dispatch(registerAction(formData)),
		autoSignIn: () => dispatch(autoSignIn()),
		registrationStart: plan => dispatch(registrationStart(plan)),
		registrationComplete: plan => dispatch(registrationComplete(plan)),
		registrationCancel: plan => dispatch(registrationCancel(plan))
	};
}

const ConnectedCreateAccountForm = connect<StateProps, DispatchProps, CreateAccountOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(CreateAccountForm);

export default ConnectedCreateAccountForm;
