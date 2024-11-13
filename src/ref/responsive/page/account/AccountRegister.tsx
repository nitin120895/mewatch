import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { Register as key } from 'shared/page/pageKey';
import CreateAccountForm from 'ref/responsive/page/account/registration/CreateAccountForm';

interface AccountRegisterStateProps {
	plan: api.Plan | undefined;
}

const AccountRegister = (props: AccountRegisterStateProps) => {
	return (
		<div className="pg-register">
			<CreateAccountForm plan={props.plan} />
		</div>
	);
};

function mapStateToProps(state: state.Root): AccountRegisterStateProps {
	const plans = (state.app.config && state.app.config.subscription && state.app.config.subscription.plans) || [];

	return {
		plan: plans[0]
	};
}

export default configPage<AccountRegisterStateProps>(AccountRegister, {
	theme: 'registration',
	key,
	template,
	mapStateToProps
});
