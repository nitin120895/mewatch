import { expect } from 'chai';
import { filterSubscriptionEntries } from '../filterSubscriptions';

const entries = [
	{
		title: 'Entry 1',
		plan: {
			pricePlans: [{ id: '123456' }]
		}
	},
	{
		title: 'Entry 2',
		plan: {
			pricePlans: [{ id: '456789' }]
		}
	},
	{
		title: 'Entry 3',
		plan: {
			pricePlans: [{ id: '654321' }]
		}
	}
] as api.PageEntry[];

export function showErrorModal() {
	// Show error modal
}

describe.only('episode range', () => {
	describe('calcEpisodeGroups', () => {
		it('should return 2 entries', () => {
			const pricePlanIds = ['123456', '456789'];
			const result = filterSubscriptionEntries(entries, pricePlanIds, showErrorModal);
			expect(result.length).to.equal(2);
			expect(result).to.deep.equal([
				{
					title: 'Entry 1',
					plan: {
						pricePlans: [{ id: '123456' }]
					}
				},
				{
					title: 'Entry 2',
					plan: {
						pricePlans: [{ id: '456789' }]
					}
				}
			]);
		});

		it('should return the first and third entry', () => {
			const pricePlanIds = ['123456', '654321'];
			const result = filterSubscriptionEntries(entries, pricePlanIds, showErrorModal);
			expect(result.length).to.equal(2);
			expect(result).to.deep.equal([
				{
					title: 'Entry 1',
					plan: {
						pricePlans: [{ id: '123456' }]
					}
				},
				{
					title: 'Entry 3',
					plan: {
						pricePlans: [{ id: '654321' }]
					}
				}
			]);
		});

		it('should return zero entries and show error modal', () => {
			const pricePlanIds = ['875634'];
			const result = filterSubscriptionEntries(entries, pricePlanIds, showErrorModal);
			expect(result.length).to.equal(0);
		});

		it('should return zero entries and show error modal', () => {
			const pricePlanIds = [];
			const result = filterSubscriptionEntries(entries, pricePlanIds, showErrorModal);
			expect(result.length).to.equal(0);
		});
	});
});
