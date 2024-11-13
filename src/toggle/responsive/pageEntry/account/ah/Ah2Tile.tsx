import * as React from 'react';
import AhRow from 'ref/responsive/pageEntry/account/ah/AhRow';
import AhTitle from 'ref/responsive/pageEntry/account/ah/AhTitle';
import U2Tile from 'ref/responsive/pageEntry/user/U2Tile';
import { getAccountFullName } from 'toggle/responsive/pageEntry/account/accountUtils';

interface Ah2TileProps extends PageEntryListProps {
	account: api.Account;
}

export default class Ah2Tile extends React.Component<Ah2TileProps, any> {
	static defaultProps = {
		account: {}
	};

	render() {
		const { list, account } = this.props;
		const fullAccountName = getAccountFullName(account);

		return (
			<AhRow className="ah2">
				<AhTitle title={fullAccountName} />
				{!!list.items.length && <U2Tile {...this.props} />}
			</AhRow>
		);
	}
}
