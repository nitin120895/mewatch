import * as React from 'react';
import { A6Preferences as template } from 'shared/page/pageEntryTemplate';
import { AccountPreferences as preferencesPageKey } from 'shared/page/pageKey';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';

type A6PreferencesProps = PageProps & {
	account: api.Account;
};
function A6Preferences(props: A6PreferencesProps) {
	const { account, activeProfile } = props;
	return (
		<div>
			<AccountEntryWrapper
				buttonPath={`@${preferencesPageKey}`}
				buttonDisabled={account.primaryProfileId !== activeProfile.id}
				{...props}
			>
				<IntlFormatter className="classification-text">{'@{account_a6_description_classifications}'}</IntlFormatter>
			</AccountEntryWrapper>
		</div>
	);
}

A6Preferences.template = template;

export default A6Preferences;
