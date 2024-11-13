import * as React from 'react';
import A99Segments from 'ref/responsive/pageEntry/account/a99/A99Segments';
import createMockPageEntry from 'viewer/ref/page/util/mockData';

let mockEntry = createMockPageEntry('A99', 'Account Segments', 'A99');
mockEntry = Object.assign({}, mockEntry);

export default class A99AccountSegmentComponent extends React.Component<PageEntryItemProps, any> {
	render() {
		return (
			<div className="pg-account grid-margin form--full-width form-white">
				<p>NOTE: This row is for demonstration purposes only and isn't expected to exist in a production app.</p>
				<p>
					This component is requires you to be logged in, in order to use all functionality. To see it working from end
					to end, please log in and view the component in the "My Account" Section
				</p>
				<section className="page-entry">
					<A99Segments {...mockEntry} />
				</section>
			</div>
		);
	}
}
