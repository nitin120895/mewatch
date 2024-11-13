import { BaseSubTypes, matchItemSubType } from 'shared/util/itemUtils';
import { expect } from 'chai';

describe('Item Utils', () => {
	describe('(Function) matchItemSubType', () => {
		it("should return true if item's subtype contains target base subtype", () => {
			const item = {
				subtype: 'NewsSeries'
			} as api.ItemSummary;

			const isNews = matchItemSubType(item, BaseSubTypes.News);

			expect(isNews).to.equal(true);
		});

		it("should return true if item's subtype doesn't contain target base subtype", () => {
			const item = {
				subtype: 'ProgramExtra'
			} as api.ItemSummary;
			const isNews = matchItemSubType(item, BaseSubTypes.News);

			expect(isNews).to.equal(false);
		});
	});
});
