import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import configPage from '../configPage';
import configStore from 'shared/configStore';

describe('configPage', () => {
	it('renders', () => {
		const Page = configPage(PageEg, { template: 'PageEg' });
		const store = configStore();
		const state: state.Root = store.getState();
		const wrapper = shallow(<Page store={store} location={state.page.history.location} />);

		const props = wrapper.props();
		expect(props.loading, 'loading').to.equal(false);
		expect(props.location, 'location').to.exist;
		expect(props.strings, 'strings').to.exist;
		expect(props.children, 'children').to.not.exist;
	});
});

function PageEg(props) {
	return <div />;
}
