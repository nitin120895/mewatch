import { getGSTAmount } from '../subscriptionsUtils';
import { expect } from 'chai';

describe('GST Calculations', () => {
	describe('GST is set to a non 7% value', () => {
		beforeEach(() => {
			process.env.CLIENT_GST_RATE = 10;
		});

		afterEach(() => {
			delete process.env.CLIENT_GST_RATE;
		});

		it('should calculate GST correctly', () => {
			expect(getGSTAmount(0)).to.equal(0);
			expect(getGSTAmount(100)).to.equal(9.09);
		});
	});

	describe('GST is set to a float', () => {
		beforeEach(() => {
			process.env.CLIENT_GST_RATE = 20.5;
		});

		afterEach(() => {
			delete process.env.CLIENT_GST_RATE;
		});

		it('should calculate GST correctly', () => {
			expect(getGSTAmount(0)).to.equal(0);
			expect(getGSTAmount(100)).to.equal(17.01);
		});
	});

	describe('CLIENT_GST_RATE is empty', () => {
		beforeEach(() => {
			process.env.CLIENT_GST_RATE = undefined;
		});

		afterEach(() => {
			delete process.env.CLIENT_GST_RATE;
		});

		it('should calculate GST correctly', () => {
			expect(getGSTAmount(0)).to.equal(0);
			expect(getGSTAmount(100)).to.equal(6.54);
		});
	});

	describe('CLIENT_GST_RATE is not set, GST rate should be 7%', () => {
		it('must not fail if the environment variable does not exist', () => {
			beforeEach(() => {
				delete process.env.CLIENT_GST_RATE;
			});

			expect(getGSTAmount(0)).to.equal(0);
			expect(getGSTAmount(100)).to.equal(6.54);
		});
	});
});
