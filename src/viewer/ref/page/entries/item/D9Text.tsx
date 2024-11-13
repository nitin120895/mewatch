import * as React from 'react';
import D9CastCrewText from 'ref/responsive/pageEntry/itemDetail/d9/D9CastCrewText';

const credits = require('./TestCredits.json');

const item: api.ItemDetail = {
	id: 'foo',
	type: 'movie',
	title: 'Example Item',
	path: '/movie/foo',
	credits: credits as api.Credit[]
};
const mock: PageEntryItemProps = {
	title: 'Example Item',
	template: 'D9',
	savedState: {},
	item: item,
	id: 'd9'
};

export default class D9Text extends React.Component<PageProps, any> {
	render() {
		return <D9CastCrewText {...mock} />;
	}
}
