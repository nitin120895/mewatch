import { expect } from 'chai';
import { get } from 'shared/util/objects';

describe('objects', () => {
	describe('get', () => {
		it('should return with undefined if the path not exists', () => {
			expect(get({}, 'a.b.c')).to.equal(undefined);
			expect(get({}, ['a', 'b', 'c'])).to.equal(undefined);

			// tslint:disable-next-line:no-null-keyword
			expect(get({ a: null }, 'a.b.c')).to.equal(undefined);
			// tslint:disable-next-line:no-null-keyword
			expect(get({ a: null }, ['a', 'b', 'c'])).to.equal(undefined);
		});

		it('should return with value of the key if the path exists', () => {
			expect(get({ a: { b: { c: 1 } } }, 'a.b.c')).to.equal(1);
			expect(get({ a: { b: { c: 1 } } }, ['a', 'b', 'c'])).to.equal(1);
		});

		it('should work with array', () => {
			expect(get({ a: [{ b: 1 }] }, 'a.0.b')).to.equal(1);
			expect(get({ a: [{ b: 1 }] }, ['a', 0, 'b'])).to.equal(1);
		});
	});
});
