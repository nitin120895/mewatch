import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './AhTitle.scss';

interface AhTitleProps {
	title: string;
}

export default class AhTitle extends React.Component<AhTitleProps, any> {
	defaultProps: {
		title: '';
	};

	render() {
		const { title } = this.props;
		return (
			<IntlFormatter values={{ name: title }} elementType={'h1'} className={'ah-title titlecase'}>
				{`@{account_ah_greeting|Hello {name}}`}
			</IntlFormatter>
		);
	}
}
