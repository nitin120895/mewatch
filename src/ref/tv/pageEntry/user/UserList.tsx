import * as React from 'react';
import { connect } from 'react-redux';
import { AssetListProps } from 'ref/tv/component/AssetList';
import EntryList from 'ref/tv/component/EntryList';

export interface UserListProps extends AssetListProps {
	profile: state.Profile;
}

class UserList extends React.Component<UserListProps, any> {
	constructor(props: UserListProps) {
		super(props);
	}

	render() {
		return <EntryList {...this.props} isUserList />;
	}
}

function mapStateToProps({ profile }: state.Root): any {
	return { profile };
}

export default connect<UserListProps, any, UserListProps>(
	mapStateToProps,
	undefined
)(UserList);
