import * as React from 'react';
import Carousel from '../common/Carousel';

import './H1Standard.scss';

const Component: any = (props: PageEntryListProps) => {
	return (
		<div className="full-bleed">
			<div className="h1-hero">
				<Carousel {...props} />
			</div>
		</div>
	);
};
Component.template = 'H1';
export default Component;
