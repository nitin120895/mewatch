import * as React from 'react';
import { A1Details, A1DetailsPropsBase } from 'ref/responsive/pageEntry/account/a1/A1Details';
import createMockPageEntry from 'viewer/ref/page/util/mockData';

import './AccountComponents.scss';

const a1MockEntry = createMockPageEntry('A1', 'Manage', 'A1');
const mock = {
	...a1MockEntry
};

// Seeing as we have no store, this component needs to act like a store and provide
// the values that would come from the store to the a1details
interface A1DetailsPageState {
	vertificationSending?: boolean;
}

export default class A1DetailsPage extends React.Component<PageEntryItemProps, any> {
	state: A1DetailsPageState = {
		vertificationSending: false
	};

	private sendVerification = () =>
		new Promise(resolve => {
			this.setState({ vertificationSending: true });
			// fakes sending to the server taking 2 seconds
			// we can extend this to include an error condition pretty easily
			// by just returning res.error = true in the resolve
			window.setTimeout(() => {
				this.setState({ vertificationSending: false });
				resolve({});
			}, 2000);
		});

	// we need this details locally per component instance
	// so it can gain access to sendVertification and setState
	private details: A1DetailsPropsBase = {
		info: {
			// required fields on api.Account
			id: '1',
			trackingEnabled: false,
			pinEnabled: true,
			marketingEnabled: false,
			primaryProfileId: '',
			subscriptionCode: '',
			profiles: [],
			// these are the only fields we care about
			firstName: 'Aegon',
			lastName: 'Targaryen',
			email: 'Aegon.Targaryen@north.org'
		},
		sendVerification: this.sendVerification
	};

	render() {
		const val = {
			...mock,
			...this.details,
			sendingVerification: this.state.vertificationSending
		};
		return (
			<div className="app--account">
				<div className="account-page-wrapper page">
					<div className="pg-account">
						<section className="page-entry">
							<A1Details {...val} />
						</section>
					</div>
				</div>
			</div>
		);
	}
}
