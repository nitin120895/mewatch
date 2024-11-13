import * as React from 'react';
import D8CastCrew from 'ref/responsive/pageEntry/itemDetail/d8/D8CastCrew';

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
	template: 'D8',
	savedState: {},
	item: item,
	id: 'd8'
};

export default class D8Circle extends React.Component<PageProps, any> {
	render() {
		return <D8CastCrew {...mock} />;
	}
}
