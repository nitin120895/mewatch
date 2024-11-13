import * as React from 'react';
import H10Text, { H10PageEntryProps } from '../h10/H10Text';

export default class H11PageTitle extends React.Component<H10PageEntryProps, {}> {
	render() {
		return <H10Text {...this.props} text={this.props.title} />;
	}
}
