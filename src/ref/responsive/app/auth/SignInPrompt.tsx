import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as Redux from 'redux';
import { signIn } from 'shared/account/sessionWorkflow';
import { Cancellation } from 'shared/app/errors';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface SignInProps {
	prompt: AuthPrompt;
	cancel: () => any;
}

export default class SignIn extends React.Component<SignInProps, any> {
	static contextTypes: any = {
		store: PropTypes.object.isRequired
	};
	context: { store: Redux.Store<state.Root> };

	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: '',
			remember: false
		};
	}

	private onTextChange = e => {
		this.setState({ [e.target.name]: e.target.value });
	};

	private onCheckboxChange = e => {
		const name = e.target.name;
		this.setState({ [name]: !this.state[name] });
	};

	private onSubmit = e => {
		e.preventDefault();
		const { prompt } = this.props;
		const { email, password, remember } = this.state;
		this.context.store.dispatch(signIn(email, password, remember, prompt.body, prompt.redirectPath));
	};

	private onCancel = e => {
		e.preventDefault();
		const { prompt, cancel } = this.props;
		if (prompt.reject) prompt.reject(new Cancellation());
		cancel();
	};

	render() {
		return (
			<form className="login-form" onSubmit={this.onSubmit}>
				<IntlFormatter
					className="form-group"
					elementType="input"
					type="text"
					name="email"
					value={this.state.email}
					onChange={this.onTextChange}
					formattedProps={{
						placeholder: '@{form_signIn_email_label|Email}'
					}}
				/>
				<IntlFormatter
					className="form-group"
					elementType="input"
					type="password"
					name="password"
					value={this.state.password}
					onChange={this.onTextChange}
					formattedProps={{
						placeholder: '@{form_signIn_password_label|Password}'
					}}
				/>
				<IntlFormatter elementType="label" className="form-group">
					<input
						type="checkbox"
						name="remember"
						checked={this.state.remember}
						value={'remember'}
						onChange={this.onCheckboxChange}
					/>
					{'@{form_signIn_rememberMe_label|Stay Signed in}'}
				</IntlFormatter>
				<div className="form-group btn-group">
					<IntlFormatter className="btn" elementType="button">
						{'@{nav_signIn_label|Sign In}'}
					</IntlFormatter>
					<IntlFormatter className="btn" onClick={this.onCancel} elementType="button">
						{'@{account_common_cancel_button_label|Cancel}'}
					</IntlFormatter>
				</div>
				{this.renderError()}
			</form>
		);
	}

	private renderError(): any {
		const { error } = this.props.prompt;
		if (!error) return false;
		return <label>{error.message}</label>;
	}
}
