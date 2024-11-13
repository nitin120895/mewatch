import * as React from 'react';
import AhTitle from './AhTitle';

interface Ah3TextProps extends PageEntryPropsBase {
	profile?: api.ProfileDetail | api.ProfileSummary;
}

export default class Ah3Text extends React.Component<Ah3TextProps, any> {
	static defaultProps = {
		profile: {}
	};

	render() {
		const { profile } = this.props;
		return (
			<div className="ah3">
				<AhTitle title={profile.name} />
			</div>
		);
	}
}
