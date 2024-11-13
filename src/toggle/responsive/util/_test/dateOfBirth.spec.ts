import { validateAge, VALID_AGE } from '../dateOfBirth';
import { expect } from 'chai';

describe.only('validate age', () => {
	describe('validateAge when sending date as string', () => {
		it('should return true since user is older than valid age', () => {
			const result = validateAge('16/08/1994');

			expect(result).to.equal(true);
		});

		it('should return false since the user is younger than valid age', () => {
			const result = validateAge('16/08/2019');

			expect(result).to.equal(false);
		});

		it('should return true since the user is older than valid age', () => {
			const result = validateAge('1993-08-16');

			expect(result).to.equal(true);
		});

		it('should return false because although the year is valid the user is still not 21', () => {
			const date = new Date();
			date.setDate(date.getDate() + 5);
			date.setFullYear(date.getFullYear() - VALID_AGE);

			const result = validateAge(date);
			expect(result).to.equal(false);
		});

		it('should return true since the year is valid and also the user has already turned 21', () => {
			const date = new Date();
			date.setDate(date.getDate() - 5);
			date.setFullYear(date.getFullYear() - VALID_AGE);

			const result = validateAge(date);
			expect(result).to.equal(true);
		});

		it('should return true since the user is turning 21 today', () => {
			const date = new Date();
			date.setFullYear(date.getFullYear() - VALID_AGE);

			const result = validateAge(date);
			expect(result).to.equal(true);
		});
	});

	describe('validateAge when sending date as Date object', () => {
		it('should return true since user is older than valid age', () => {
			const result = validateAge(new Date('1994-08-16'));

			expect(result).to.equal(true);
		});

		it('should return false since the user is younger than valid age', () => {
			const result = validateAge(new Date('2019-08-16'));

			expect(result).to.equal(false);
		});

		it('should return true since the user is older than valid age', () => {
			const result = validateAge(new Date('1993-08-16'));

			expect(result).to.equal(true);
		});

		it('should return false because although the year is valid the user is still not 21', () => {
			const date = new Date();
			date.setDate(date.getDate() + 5);
			date.setFullYear(date.getFullYear() - VALID_AGE);

			const result = validateAge(date);
			expect(result).to.equal(false);
		});

		it('should return true since the year is valid and also the user has already turned 21', () => {
			const date = new Date();
			date.setDate(date.getDate() - 5);
			date.setFullYear(date.getFullYear() - VALID_AGE);

			const result = validateAge(date);
			expect(result).to.equal(true);
		});

		it('should return true since the user is turning 21 today', () => {
			const date = new Date();
			date.setFullYear(date.getFullYear() - VALID_AGE);

			const result = validateAge(date);
			expect(result).to.equal(true);
		});
	});
});
