import * as React from 'react';
import SendEmail from 'ref/responsive/page/auth/resetPassword/SendEmailForm';
import NewPasswordForm from 'ref/responsive/page/auth/resetPassword/NewPasswordForm';
import * as cx from 'classnames';

import '../inputs/FormElements.scss';

// Styles are imported by parent component so needs to be imported here.
import 'ref/responsive/page/auth/ResetPassword.scss';

const promise = (...params): Promise<api.Response<any>> =>
	new Promise(resolve => {
		setTimeout(() => {
			resolve({ raw: undefined, data: 'Not implemented', error: true });
		}, 1000);
	});

export default class ResetPasswordComponent extends React.Component<any, any> {
	constructor() {
		super();
		this.state = {
			currentForm: 'sendEmail'
		};
	}

	onChange = e => {
		this.setState({ currentForm: e.target.value });
	};

	render() {
		const showNewPassword = this.state.currentForm === 'newPassword';
		return (
			<div>
				<p>
					<i>To reset the form to first initial state, toggle between the form on and off.</i>
				</p>
				<form>
					<p>
						<label>
							<input
								type="radio"
								name="form-to-show"
								value="sendEmail"
								checked={!showNewPassword}
								onChange={this.onChange}
							/>
							Send Email Form
						</label>
					</p>
					<p>
						<label>
							<input
								type="radio"
								name="form-to-show"
								value="newPassword"
								checked={showNewPassword}
								onChange={this.onChange}
							/>
							New Password Form
						</label>
					</p>
				</form>
				<div className={cx('form', 'form-blue')}>
					{showNewPassword ? (
						<NewPasswordForm newPassword={promise} token={''} />
					) : (
						<SendEmail sendResetEmail={promise} />
					)}
				</div>
			</div>
		);
	}
}
