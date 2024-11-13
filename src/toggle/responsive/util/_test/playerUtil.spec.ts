import { expect } from 'chai';
import { getClosestAdRoll } from '../playerUtil';

describe('getClosetAdRoll', () => {
	it('Must return undefined for certain situations', () => {
		expect(getClosestAdRoll(undefined, [])).to.be.undefined;
		expect(getClosestAdRoll(0, [])).to.be.undefined;
		expect(getClosestAdRoll(0, [1, 2, 3])).to.be.undefined;
		expect(getClosestAdRoll(0, [])).to.be.undefined;
		expect(getClosestAdRoll(110, [])).to.be.undefined;
		expect(getClosestAdRoll(-1, [1, 2, 3])).to.be.undefined;
		expect(getClosestAdRoll(100, [101, 200, 300])).to.be.undefined;
	});

	it('Must return the closest ad roll to the resume point minus one for positive resume points', () => {
		expect(getClosestAdRoll(1, [1, 2, 3])).to.equal(0);
		expect(getClosestAdRoll(100, [100, 200, 300])).to.equal(99);
	});
});
