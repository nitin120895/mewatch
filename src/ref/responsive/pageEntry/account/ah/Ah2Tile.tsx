import * as React from 'react';
import AhRow from './AhRow';
import AhTitle from './AhTitle';
import U2Tile from 'ref/responsive/pageEntry/user/U2Tile';

interface Ah2TileProps extends PageEntryListProps {
	profile?: api.ProfileDetail | api.ProfileSummary;
}

export default class Ah2Tile extends React.Component<Ah2TileProps, any> {
	static defaultProps = {
		profile: {}
	};

	render() {
		const { list, profile } = this.props;
		return (
			<AhRow className="ah2">
				<AhTitle title={profile.name} />
				{!!list.items.length && <U2Tile {...this.props} />}
			</AhRow>
		);
	}
}
