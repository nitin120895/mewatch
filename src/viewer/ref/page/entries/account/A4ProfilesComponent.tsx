import * as React from 'react';
import A4Profiles from 'ref/responsive/pageEntry/account/a4/A4Profiles';
import createMockPageEntry from 'viewer/ref/page/util/mockData';

const profiles = [
	{
		id: '1',
		name: 'Lydia',
		color: '#666',
		pinEnabled: true,
		segments: ['test']
	},
	{
		id: '2',
		name: 'Calder-Manning',
		color: '#209de6',
		pinEnabled: true,
		segments: ['test']
	},
	{
		id: '3',
		name: 'Iona',
		color: '#ff735e',
		pinEnabled: true,
		segments: ['Kids', 'test2']
	},
	{
		id: '4',
		name: 'Jordis',
		color: '#cdd44d',
		pinEnabled: false,
		segments: []
	},
	{
		id: '5',
		name: 'Gregory',
		color: '#cdd44d',
		pinEnabled: false,
		segments: []
	},
	{
		id: '6',
		name: 'Argiswark',
		color: '#ff735e',
		pinEnabled: true,
		segments: ['test6']
	},
	{
		id: '7',
		name: 'Rayyahfaajd',
		color: '#209de6',
		pinEnabled: true,
		segments: ['Kids']
	}
];

function getMockedAccount(profiles) {
	return { account: { info: { profiles: profiles, primaryProfileId: '1' } } };
}

const a4MockEntry = createMockPageEntry('A4', 'Profiles', 'A4');
const mock: any = Object.assign({}, a4MockEntry, getMockedAccount(profiles));
const mockBasic: any = Object.assign({}, a4MockEntry, getMockedAccount([profiles[0]]));

export default class A4ProfilesComponent extends React.Component<PageEntryItemProps, any> {
	render() {
		return (
			<div className="app--account">
				<div className="account-page-wrapper a1-viewer page">
					<div className="pg-account">
						<h4 className="account-section-description">Account has many secondary profiles</h4>
						<section className="page-entry">
							<A4Profiles {...mock} />
						</section>

						<h4 className="account-section-description">Account only has a primary profile</h4>
						<section className="page-entry">
							<A4Profiles {...mockBasic} />
						</section>
					</div>
				</div>
			</div>
		);
	}
}
