import * as React from 'react';
import SignInForm from 'ref/responsive/page/auth/SignInForm';

import '../inputs/FormElements.scss';

export default class SignInFormComponent extends React.Component<any, any> {
	private getRedirectPath = (defaultPath?: string) => '/';
	private signIn = (email: string, password: string, remember: boolean, scopes: string[], redirectPath?: string) =>
		new Promise(res => setTimeout(res, 1000));
	private singleSignOn = (options: api.SingleSignOnRequest, redirectPath: string) =>
		new Promise(res => setTimeout(res, 1000));

	render() {
		return (
			<div className="form form-blue">
				<SignInForm getRedirectPath={this.getRedirectPath} signIn={this.signIn} singleSignOn={this.singleSignOn} />
			</div>
		);
	}
}
