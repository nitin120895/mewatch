import * as React from 'react';
import AhRow from 'ref/responsive/pageEntry/account/ah/AhRow';
import AhTitle from 'ref/responsive/pageEntry/account/ah/AhTitle';
import U1Poster from 'ref/responsive/pageEntry/user/U1Poster';
import { getAccountFullName } from 'toggle/responsive/pageEntry/account/accountUtils';

interface Ah1PosterProps extends PageEntryListProps {
	account: api.Account;
}

export default class Ah1Poster extends React.Component<Ah1PosterProps, any> {
	static defaultProps = {
		account: {}
	};
	render() {
		const { list, account } = this.props;
		const fullAccountName = getAccountFullName(account);

		return (
			<AhRow className="ah1">
				<AhTitle title={fullAccountName} />
				{!!list.items.length && <U1Poster {...this.props} />}
			</AhRow>
		);
	}
}
