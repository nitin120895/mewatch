import { removeExpiredToken, removeDuplicateTokens, hasToken, findToken, pruneTokens } from '../tokens';
import { expect } from 'chai';

describe('tokenUtils', () => {
	const tokenExpired: api.AccessToken = {
		value: 'tokenExpired',
		refreshable: false,
		expirationDate: new Date(0),
		type: 'UserAccount'
	};
	const tokenActive: api.AccessToken = {
		value: 'tokenActive',
		refreshable: true,
		expirationDate: new Date(Date.now() + 1000000),
		type: 'UserAccount'
	};
	const tokenDuplicateOlder: api.AccessToken = {
		value: 'tokenDuplicateOlder',
		refreshable: true,
		expirationDate: new Date(Date.now() + 100000),
		type: 'UserAccount',
		scope: 'Catalog'
	};
	const tokenDuplicateNewer: api.AccessToken = {
		value: 'tokenDuplicateNewer',
		refreshable: true,
		expirationDate: new Date(Date.now() + 1000000),
		type: 'UserAccount',
		scope: 'Catalog'
	};
	const tokenUnique: api.AccessToken = {
		value: 'tokenUnique',
		refreshable: true,
		expirationDate: new Date(Date.now() + 1000000),
		type: 'UserProfile'
	};
	const tokenRequired: api.AccessToken = {
		value: 'tokenRequired',
		refreshable: true,
		expirationDate: new Date(Date.now() + 1000000),
		type: 'UserAccount',
		scope: 'Catalog'
	};
	const tokenNotRequired: api.AccessToken = {
		value: 'tokenNotRequired',
		refreshable: true,
		expirationDate: new Date(Date.now() + 1000000),
		type: 'UserProfile',
		scope: 'Settings'
	};
	// const tokenValidPlayback: api.AccessToken = {
	// 	value: 'tokenValidPlayback',
	// 	refreshable: false,
	// 	expirationDate: new Date(Date.now() + 1000000),
	// 	type: 'UserProfile',
	// 	scope: 'Playback'
	// };
	// const tokenInvalidPlayback: api.AccessToken = {
	// 	value: 'tokenInvalidPlayback',
	// 	refreshable: false,
	// 	expirationDate: new Date(0),
	// 	type: 'UserProfile',
	// 	scope: 'Playback'
	// };

	describe('removeExpiredToken', () => {
		it('should remove expired tokens', () => {
			let tokens = [tokenExpired];
			expect(removeExpiredToken(tokens)).to.deep.equal([]);
			tokens = [tokenActive];
			expect(removeExpiredToken(tokens)).to.deep.equal([tokenActive]);
			tokens = [tokenExpired, tokenActive];
			expect(removeExpiredToken(tokens)).to.deep.equal([tokenActive]);
		});
	});

	describe('removeDuplicateTokens', () => {
		it('should remove duplicate tokens', () => {
			let tokens = [tokenDuplicateOlder, tokenDuplicateNewer, tokenUnique];
			expect(removeDuplicateTokens(tokens)).to.deep.equal([tokenDuplicateNewer, tokenUnique]);
			tokens = [tokenDuplicateOlder, tokenDuplicateNewer];
			expect(removeDuplicateTokens(tokens)).to.deep.equal([tokenDuplicateNewer]);
			tokens = [tokenDuplicateNewer, tokenUnique];
			expect(removeDuplicateTokens(tokens)).to.deep.equal([tokenDuplicateNewer, tokenUnique]);
		});
	});

	describe('pruneTokens', () => {
		it('should prune tokens (remove expired and duplicate tokens)', () => {
			let tokens = [tokenExpired, tokenActive, tokenDuplicateOlder, tokenDuplicateNewer, tokenUnique];
			expect(pruneTokens(tokens)).to.deep.equal([tokenActive, tokenDuplicateNewer, tokenUnique]);
		});
	});

	describe('hasToken', () => {
		it('should return true if specified token is present and false if not', () => {
			let tokens = [tokenRequired];
			expect(hasToken(tokens, 'UserAccount', 'Catalog')).to.be.true;
			tokens = [tokenRequired, tokenNotRequired];
			expect(hasToken(tokens, 'UserAccount', 'Catalog')).to.be.true;
		});

		it('should return false if specified token is not present', () => {
			let tokens = [tokenNotRequired];
			expect(hasToken(tokens, 'UserAccount', 'Catalog')).to.be.false;
		});
	});

	describe('findToken', () => {
		it('should find the specified token', () => {
			let tokens = [tokenRequired, tokenNotRequired];
			expect(findToken(tokens, 'UserAccount', 'Catalog')).to.deep.equal(tokenRequired);
			tokens = [tokenRequired];
			expect(findToken(tokens, 'UserAccount', 'Catalog')).to.deep.equal(tokenRequired);
			tokens = [tokenNotRequired];
			expect(findToken(tokens, 'UserAccount', 'Catalog')).to.be.undefined;
		});
	});

	// describe('isInvalidToken', () => {
	// 	it('should return true if specified token is invalid', () => {
	// 		expect(isInvalidToken(tokenInvalidPlayback)).to.be.true;
	// 	});

	// 	it('should return false if specified token is valid', () => {
	// 		expect(isInvalidToken(tokenValidPlayback)).to.be.false;
	// 	});
	// });
});
