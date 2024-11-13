import * as React from 'react';
import Carousel from '../common/Carousel';
import H1Standard from '../h1/H1Standard';

import './H2Peeking.scss';

const Component: any = (props: PageEntryListProps) => {
	const { list } = props;
	// Peeking is only possible with 2 or more items. When there's only
	// one we instead render an H1 instance which doesn't have that limitation.
	if (list.items.length < 1) {
		return <H1Standard {...props} />;
	}
	return (
		<div className="full-bleed">
			<div className="h2-hero">
				<Carousel {...props} isPeeking />
			</div>
		</div>
	);
};

Component.template = 'H2';
export default Component;
