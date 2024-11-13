import * as React from 'react';
import H10Text from '../h10/H10Text';

export default class H11PageTitle extends React.Component<PageEntryTextProps, any> {
	render() {
		return <H10Text {...this.props} text={this.props.title} />;
	}
}
