import * as React from 'react';
import { configPage } from 'shared/';
import { resetPassword as newPassword } from 'shared/account/accountWorkflow';
import { forgotPassword as sendResetEmail } from 'shared/service/action/support';
import { STATIC as template } from 'shared/page/pageTemplate';
import { ResetPassword as key } from 'shared/page/pageKey';
import NewPassword from './resetPassword/NewPasswordForm';
import SendEmail from './resetPassword/SendEmailForm';

import './ResetPassword.scss';

function ResetPassword(props) {
	const { location, ...rest } = props;
	const { Token: token, email } = location.query;
	return token ? <NewPassword token={token} {...rest} /> : <SendEmail email={email} {...rest} />;
}

function mapDispatchToProps(dispatch) {
	return {
		sendResetEmail: email => dispatch(sendResetEmail(email)),
		newPassword: (email, password, token) => dispatch(newPassword(email, password, token))
	};
}

export default configPage(ResetPassword, {
	theme: 'auth',
	key,
	template,
	mapDispatchToProps
});
