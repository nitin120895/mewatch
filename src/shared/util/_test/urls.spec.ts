import { expect } from 'chai';
import { isValidURL, isValidURLPart, validateLocation } from '../urls';

const VALID_URL = 'https://www.example.com';
const VALID_URL_WITH_SEARCH_1 = 'https://www.example.com/test?id=1';
const VALID_URL_WITH_SEARCH_2 = 'https://www.example.com/test?id=1&page=2&entry=3';
const INVALID_URL = 'https://www.example.com/?<script';
const INVALID_URL_1 =
	"https://demo2.massiveaxis.com/?'%22/%3E--%3E%3C/title%3E%3C/style%3E%3C/script%20dt=fy%3E%3Cdtfy%3E";

const VALID_URL_SEARCH_PART_1 = '?id=1';
const VALID_URL_SEARCH_PART_2 = '?id=1&page=2&entry=3';
const INVALID_URL_PART = "/?'%22/%3E--%3E%3C/title%3E%3C/style%3E%3C/script%20dt=fy%3E%3Cdtfy%3E";

const VALID_LOCATION: HistoryLocation = {
	pathname: '/test/test_1',
	search: '?id=1',
	query: {
		id: '111'
	},
	state: 'state',
	key: 'key',
	action: undefined,
	index: 0
};

const INVALID_LOCATION: HistoryLocation = {
	pathname: '/test/test_1<script',
	search: '?id=1%3C/script',
	query: {
		id: '%3C/script'
	},
	state: 'state',
	key: 'key',
	action: undefined,
	index: 0
};

// Tests
describe('URLs and parts', () => {
	describe('URLs', () => {
		it('should validate simple url', () => {
			expect(isValidURL(VALID_URL)).to.equal(true);
		});

		it('should validate simple url with one search param', () => {
			expect(isValidURL(VALID_URL_WITH_SEARCH_1)).to.equal(true);
		});

		it('should validate simple url with many search params', () => {
			expect(isValidURL(VALID_URL_WITH_SEARCH_2)).to.equal(true);
		});

		it('should invalidate url with restricted symbols', () => {
			expect(isValidURL(INVALID_URL)).to.equal(false);
		});

		it('should invalidate another url with restricted symbols', () => {
			expect(isValidURL(INVALID_URL_1)).to.equal(false);
		});
	});

	describe('URL parts', () => {
		it('should validate url search part', () => {
			expect(isValidURLPart(VALID_URL_SEARCH_PART_1)).to.equal(true);
		});

		it('should validate another url search part', () => {
			expect(isValidURLPart(VALID_URL_SEARCH_PART_2)).to.equal(true);
		});

		it('should invalidate url part with restricted symbols', () => {
			expect(isValidURLPart(INVALID_URL_PART)).to.equal(false);
		});
	});

	describe('Location object validation', () => {
		it('should not change valid location', () => {
			const validatedLocation = validateLocation(VALID_LOCATION);
			expect(validatedLocation.pathname).to.equal(VALID_LOCATION.pathname);
			expect(validatedLocation.search).to.equal(VALID_LOCATION.search);
			expect(validatedLocation.query['id']).to.equal(VALID_LOCATION.query['id']);
		});

		it('should change invalid location', () => {
			const validatedLocation = validateLocation(INVALID_LOCATION);
			expect(validatedLocation.pathname).to.equal('');
			expect(validatedLocation.search).to.equal('');
			expect(validatedLocation.query['id']).to.equal('');
		});
	});
});
