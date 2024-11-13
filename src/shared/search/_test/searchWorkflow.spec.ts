import reduceSearch from '../searchWorkflow';
import { SEARCH_SAVE } from '../searchWorkflow';
import { expect } from 'chai';

const TEST_QUERY_1 = 'test1';
const TEST_QUERY_2 = 'askdjhsd&^*&^E*&EQWIWQU 7qw6e786qe8w eqwkshdk asdh kajshd kahsd kjh';
const TEST_QUERY_3 = '&#x1f4a9';
const TEST_QUERY_4 = 'test4';
const TEST_QUERY_5 = 'test5';
const TEST_QUERY_6 = 'test6';
const TEST_QUERY_EMPTY = '';

describe('searchWorkflow', () => {
	describe('reduceSearch', () => {
		it('should not append empty searches', () => {
			const action = {
				type: SEARCH_SAVE,
				payload: { query: TEST_QUERY_EMPTY }
			};
			const state: state.Search = reduceSearch({ recentSearches: [] }, action);
			expect(state).to.deep.equal({ recentSearches: [] });
		});
		it('should reduce SEARCH_SUBMIT action into state', () => {
			const action = { type: SEARCH_SAVE, payload: { query: TEST_QUERY_1 } };
			const state: state.Search = reduceSearch({ recentSearches: [] }, action);
			expect(state).to.deep.equal({ recentSearches: [TEST_QUERY_1] });
		});
		it('should append new searches to start of recent searches list', () => {
			const action = { type: SEARCH_SAVE, payload: { query: TEST_QUERY_2 } };
			const state: state.Search = reduceSearch({ recentSearches: [TEST_QUERY_1] }, action);
			expect(state).to.deep.equal({
				recentSearches: [TEST_QUERY_2, TEST_QUERY_1]
			});
		});
		it('should reorder searches if existing search is called again', () => {
			const action = { type: SEARCH_SAVE, payload: { query: TEST_QUERY_2 } };
			const state: state.Search = reduceSearch(
				{
					recentSearches: [TEST_QUERY_3, TEST_QUERY_2, TEST_QUERY_1]
				},
				action
			);
			expect(state).to.deep.equal({
				recentSearches: [TEST_QUERY_2, TEST_QUERY_3, TEST_QUERY_1]
			});
		});
		it('should only store a maximum of 5 searches', () => {
			const action = { type: SEARCH_SAVE, payload: { query: TEST_QUERY_6 } };
			const state: state.Search = reduceSearch(
				{
					recentSearches: [TEST_QUERY_1, TEST_QUERY_2, TEST_QUERY_3, TEST_QUERY_4, TEST_QUERY_5]
				},
				action
			);
			expect(state).to.deep.equal({
				recentSearches: [TEST_QUERY_6, TEST_QUERY_1, TEST_QUERY_2, TEST_QUERY_3, TEST_QUERY_4]
			});
		});
	});
});
