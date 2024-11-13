import { expect } from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reduceCache from '../cacheWorkflow';
import {
	CONTINUE_WATCHING_TEST_LIST_DATA,
	LIST_ITEM_MOVIE_DATA,
	LIST_ITEM_EPISODE_DATA
} from './cacheWorkflowTestData';
import {
	startedPlaying,
	clearCache,
	resumePointChanged,
	REMOVE_NEXT_ITEM,
	REMOVE_LIST_CACHE,
	NORMALIZE_NAV_LISTS
} from 'shared/cache/cacheWorkflow';
import { GET_CONTINUE_WATCHING_LIST } from '../../service/action/profile';
import { normalizeList } from '../listNormalizer';
import { ContinueWatching as continueWatchingListId } from '../../list/listId';

describe('cacheWorkflow', () => {
	beforeEach(function() {
		// init cache state
		const state: state.Cache = reduceCache(undefined, clearCache());
		// normalize Continue Watching list
		normalizeList(state.list, '__global', CONTINUE_WATCHING_TEST_LIST_DATA);
	});

	it('should reduce GET_CONTINUE_WATCHING_LIST action into state', () => {
		const payload = CONTINUE_WATCHING_TEST_LIST_DATA;
		const action = { type: GET_CONTINUE_WATCHING_LIST, payload };

		const state: state.Cache = reduceCache(undefined, action);
		expect(state.list[continueWatchingListId].list).to.deep.equal(payload);
	});

	it('should remove Continue Watching list from cache if item start playback and should not remove next item', () => {
		const payload = CONTINUE_WATCHING_TEST_LIST_DATA;
		const action = { type: GET_CONTINUE_WATCHING_LIST, payload };
		const store = configureStore([thunk])({
			cache: reduceCache(undefined, action)
		});

		// start movie's playback
		store.dispatch(startedPlaying(LIST_ITEM_MOVIE_DATA));
		expect(store.getActions()).to.deep.equal([{ type: NORMALIZE_NAV_LISTS, payload: undefined }]);
	});

	it('should remove Continue Watching list from cache if item is fully watched and should not remove next item', () => {
		const payload = CONTINUE_WATCHING_TEST_LIST_DATA;
		const action = { type: GET_CONTINUE_WATCHING_LIST, payload };
		const store = configureStore([thunk])({
			cache: reduceCache(undefined, action)
		});

		// resume point for movie has been changed, movie is fully watched
		store.dispatch(resumePointChanged(LIST_ITEM_MOVIE_DATA, true));
		expect(store.getActions()).to.deep.equal([
			{ type: REMOVE_LIST_CACHE, payload: continueWatchingListId },
			{ type: NORMALIZE_NAV_LISTS, payload: undefined }
		]);
	});

	it('should remove Continue Watching list from cache if item is fully watched, should remove next item', () => {
		const payload = CONTINUE_WATCHING_TEST_LIST_DATA;
		const action = { type: GET_CONTINUE_WATCHING_LIST, payload };
		const store = configureStore([thunk])({
			cache: reduceCache(undefined, action)
		});

		// resume point for episode has been changed, episode is fully watched
		store.dispatch(resumePointChanged(LIST_ITEM_EPISODE_DATA, true));

		expect(store.getActions()).to.deep.equal([
			{ type: REMOVE_NEXT_ITEM, payload: '442' },
			{ type: REMOVE_LIST_CACHE, payload: continueWatchingListId },
			{ type: NORMALIZE_NAV_LISTS, payload: undefined }
		]);
	});
});
