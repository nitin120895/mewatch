import reduceAccount from '../accountWorkflow';
import { GET_ACCOUNT } from 'shared/service/action/account';
import { SIGN_OUT } from '../sessionWorkflow';
import { expect } from 'chai';

describe('accountWorkflow', () => {
	describe('reduceAccount', () => {
		it('should reduce GET_ACCOUNT action into state', () => {
			const payload = {
				user: 'User'
			};
			const action = { type: GET_ACCOUNT, payload };
			const initialState = reduceAccount(undefined, { type: '' });
			const state = reduceAccount(undefined, action);
			expect(state).to.deep.equal({
				...initialState,
				info: payload,
				active: true,
				paymentData: {
					rememberCard: false,
					paymentMethods: []
				},
				purchases: { items: [] },
				purchasesLoaded: false,
				deviceInfo: {
					maxRegistered: 0,
					devices: [],
					isLoaded: false
				}
			});
		});

		it('should reduce SIGN_OUT action into state', () => {
			const action = { type: SIGN_OUT };
			const initialState = reduceAccount(undefined, { type: '' });
			const state = reduceAccount(undefined, action);

			expect(state).to.deep.equal(initialState);
			expect(state).to.deep.equal({
				active: false,
				paymentData: {
					rememberCard: false,
					paymentMethods: []
				},
				purchases: { items: [] },
				purchasesLoaded: false,
				updating: false,
				updateError: false,
				sendingVerification: false,
				deviceInfo: {
					maxRegistered: 0,
					devices: [],
					isLoaded: false
				},
				subscriptionDetails: undefined
			});
		});
	});
});
