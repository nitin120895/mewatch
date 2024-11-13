import * as React from 'react';
import A3Devices from 'ref/responsive/pageEntry/account/a3/A3Devices';
import createMockPageEntry from 'viewer/ref/page/util/mockData';

const devices = [
	{
		id: 1,
		name: "Jerry's Phone",
		type: 'phone'
	},
	{
		id: 2,
		name: 'Family Ipad',
		type: 'tablet'
	},
	{
		id: 3,
		name: 'Maria iMac',
		type: 'laptop'
	},
	{
		id: 4,
		name: 'Samsung TV',
		type: 'tv'
	},
	{
		id: 5,
		name: 'another really long TV name',
		type: 'tv'
	},
	{
		id: 6,
		name: 'tvlD0x458912839',
		type: 'tv'
	},
	{
		id: 7,
		name: "Jerry's Phone",
		type: 'phone'
	},
	{
		id: 8,
		name: 'Family Ipad',
		type: 'tablet'
	},
	{
		id: 9,
		name: 'Maria iMac',
		type: 'laptop'
	},
	{
		id: 10,
		name: 'Samsung TV',
		type: 'tv'
	},
	{
		id: 11,
		name: ' TV',
		type: 'tv'
	},
	{
		id: 12,
		name: 'tvlD0x458912839',
		type: 'tv'
	}
];

function getMockedAccount(empty = false, max = 1) {
	return { devices: empty ? [] : devices, maxDevices: max };
}

const a3MockEntry = createMockPageEntry('A3', 'Devices', 'A3');
const mock: any = Object.assign({}, a3MockEntry, getMockedAccount(false, 5));
const mockEmpty: any = Object.assign({}, a3MockEntry, getMockedAccount(true));

export default class A3DevicesComponent extends React.Component<PageEntryItemProps, any> {
	render() {
		return (
			<div className="pg-account grid-margin">
				<section className="page-entry clearfix">
					<A3Devices {...mock} />
				</section>
				<section className="page-entry clearfix">
					<A3Devices {...mockEmpty} />
				</section>
			</div>
		);
	}
}
