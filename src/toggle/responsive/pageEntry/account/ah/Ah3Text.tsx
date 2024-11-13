import * as React from 'react';
import AhTitle from 'ref/responsive/pageEntry/account/ah/AhTitle';
import AhRow from 'ref/responsive/pageEntry/account/ah/AhRow';
import { getAccountFullName } from 'toggle/responsive/pageEntry/account/accountUtils';
import { Ah3Text as Ah3TextTemplate } from 'shared/page/pageEntryTemplate';

interface Ah3TextProps extends PageEntryPropsBase {
	account: api.Account;
}

export default function Ah3Text(props: Ah3TextProps) {
	const { account } = props;
	const fullAccountName = getAccountFullName(account);

	return (
		<AhRow className="ah3">
			<AhTitle title={fullAccountName} />
		</AhRow>
	);
}

Ah3Text.template = Ah3TextTemplate;
