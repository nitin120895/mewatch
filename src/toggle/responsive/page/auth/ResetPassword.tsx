import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { ResetPassword as key } from 'shared/page/pageKey';
import SendEmail from './resetPassword/SendEmailForm';
import NewPasswordForm from './resetPassword/NewPasswordForm';
import { forgotPassword as sendResetEmail } from 'shared/service/action/support';

import './ResetPassword.scss';

function ResetPassword(props) {
	const { location, ...rest } = props;
	const { token, email } = location.query;
	if (token) {
		return <NewPasswordForm token={decodeURI(token)} email={email} {...rest} />;
	}

	return <SendEmail {...rest} />;
}

function mapDispatchToProps(dispatch) {
	return {
		sendResetEmail: email => dispatch(sendResetEmail({ email }))
	};
}

export default configPage(ResetPassword, {
	theme: 'auth',
	key,
	template,
	mapDispatchToProps
});
