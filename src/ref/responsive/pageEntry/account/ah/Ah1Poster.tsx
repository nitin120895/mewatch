import * as React from 'react';
import AhRow from './AhRow';
import AhTitle from './AhTitle';
import U1Poster from 'ref/responsive/pageEntry/user/U1Poster';

interface Ah1PosterProps extends PageEntryListProps {
	profile?: api.ProfileDetail | api.ProfileSummary;
}

export default class Ah1Poster extends React.Component<Ah1PosterProps, any> {
	static defaultProps = {
		profile: {}
	};
	render() {
		const { list, profile } = this.props;
		return (
			<AhRow className="ah1">
				<AhTitle title={profile.name} />
				{!!list.items.length && <U1Poster {...this.props} />}
			</AhRow>
		);
	}
}
