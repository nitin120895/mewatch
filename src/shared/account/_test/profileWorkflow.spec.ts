import reduceProfile from '../profileWorkflow';
import { GET_PROFILE } from 'shared/service/action/profile';
import { expect } from 'chai';

describe('profileWorkflow', () => {
	it('should reduce GET_PROFILE action into state', () => {
		const payload = {
			user: 'User'
		};
		const action = { type: GET_PROFILE, payload };
		const state: state.Profile = reduceProfile(undefined, action);
		expect(state.info).to.deep.equal(payload);
	});
});
