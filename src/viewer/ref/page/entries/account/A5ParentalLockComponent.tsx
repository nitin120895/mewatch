import * as React from 'react';
import A5ParentalLock from 'ref/responsive/pageEntry/account/a5/A5ParentalLock';
import createMockPageEntry from 'viewer/ref/page/util/mockData';

const a5MockEntry = createMockPageEntry('A5', 'A5 - Parental Lock', 'A5');

export default class A5ParentalLockComponent extends React.Component<PageEntryItemProps, any> {
	render() {
		return (
			<div className="app app--account">
				<div className="content grid-margin">
					<div className="main">
						<div className="page">
							<div className="pg-account">
								<div className="page-entry">
									<A5ParentalLock {...a5MockEntry} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
