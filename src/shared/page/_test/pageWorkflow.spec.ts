import { PAGE_CHANGE, GET_PAGE_DETAIL, GET_PAGE_SUMMARY, refreshPage, pageChange } from '../pageWorkflow';
import * as listWorkflow from 'shared/list/listWorkflow';
import reducePage from '../pageWorkflow';
import { expect } from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { PAGE_404 } from '../sitemapLookup';
import * as sinon from 'sinon';

describe('pageWorkflow', () => {
	describe('reducePage', () => {
		it('should reduce PAGE_CHANGE action into state', () => {
			const payload = {
				pathname: 'path',
				search: '?search',
				query: { queryKey: 'queryProp' },
				key: 'key',
				action: 'POP',
				index: 0
			};
			const action = { type: PAGE_CHANGE, payload: payload, meta: PAGE_404 };
			const state: state.Page = reducePage(undefined, action);

			expect(state).to.deep.equal({
				loading: false,
				history: {
					entries: [{ index: 0, state: {}, key: 'key', path: 'path?search' }],
					location: payload,
					index: 0,
					pageSummary: PAGE_404
				},
				requestBackNavigation: undefined,
				savedState: undefined
			});
		});
	});

	describe('refreshPage', () => {
		const location = {
			pathname: '/',
			search: '',
			query: {},
			state: { i: 1 },
			key: 'key',
			action: 'PUSH'
		};
		const sitemap = {
			isSystemPage: false,
			key: 'Home',
			id: '81937',
			path: '/',
			template: 'Home',
			title: 'Home'
		};
		const initialState = {
			page: {
				history: { location }
			},
			cache: {
				page: {
					'/': location
				}
			},
			app: {
				config: {
					sitemap: [sitemap]
				}
			}
		};

		it('should dispatch actions to refreshPage for dynamic pages', () => {
			const populatePageListsStub = sinon
				.stub(listWorkflow, 'populatePageLists')
				.callsFake(() => () => Promise.resolve());

			const store = configureStore([thunk])(initialState);
			store.dispatch(refreshPage());
			populatePageListsStub.restore();

			const actions = store.getActions();
			expect(actions).to.deep.equal([{ type: GET_PAGE_DETAIL, payload: location, meta: { info: location } }]);
		});

		it('should dispatch actions to refreshPage for static pages', () => {
			location.pathname = '/signin';
			sitemap.key = 'SignIn';
			sitemap.path = '/signin';
			sitemap.template = 'SignIn';
			sitemap.title = 'SignIn';

			const store = configureStore([thunk])(initialState);
			store.dispatch(refreshPage());
			const actions = store.getActions();

			expect(actions).to.deep.equal([{ type: GET_PAGE_SUMMARY, payload: sitemap, meta: location }]);
		});

		it('should return 404 error if page not found', () => {
			sitemap.path = '';
			const store = configureStore([thunk])(initialState);
			store.dispatch(refreshPage());
			const actions = store.getActions() as Action<any>[];

			expect(actions[0].payload.id).to.equal('404page');
		});
	});

	describe('pageChange', () => {
		const locationHome: any = {
			pathname: '/',
			search: '',
			query: {},
			state: { i: 1 },
			key: 'key',
			action: 'PUSH'
		};
		const locationSignIn: any = {
			pathname: '/signin',
			search: '',
			query: {},
			state: { i: 1 },
			key: 'key',
			action: 'PUSH'
		};
		const sitemapHome = {
			isSystemPage: false,
			key: 'Home',
			id: '81937',
			path: '/',
			template: 'Home',
			title: 'Home'
		};
		const sitemapSignIn = {
			isSystemPage: true,
			key: 'SignIn',
			id: '82010',
			path: '/signin',
			template: 'SignIn',
			title: 'SignIn'
		};
		const initialState = {
			page: {
				history: { location: {} }
			},
			cache: {
				page: {
					'/': locationHome,
					'/signin': locationSignIn
				}
			},
			app: {
				config: {
					sitemap: [sitemapHome, sitemapSignIn]
				}
			}
		};

		it('should dispatch actions to change the page to a dynamic page', () => {
			const populatePageListsStub = sinon
				.stub(listWorkflow, 'populatePageLists')
				.callsFake(() => () => Promise.resolve());

			initialState.page.history.location = locationSignIn;
			const store = configureStore([thunk])(initialState);
			store.dispatch(pageChange(locationHome));
			const actions = store.getActions();
			populatePageListsStub.restore();

			expect(actions).to.deep.equal([
				{ type: PAGE_CHANGE, payload: locationHome, meta: sitemapHome },
				{
					type: GET_PAGE_DETAIL,
					payload: locationHome,
					meta: { info: locationHome }
				}
			]);
		});

		it('should dispatch actions to change the page to a static page', () => {
			initialState.page.history.location = locationHome;
			const store = configureStore([thunk])(initialState);
			store.dispatch(pageChange(locationSignIn));
			const actions = store.getActions();

			expect(actions).to.deep.equal([
				{ type: PAGE_CHANGE, payload: locationSignIn, meta: sitemapSignIn },
				{ type: GET_PAGE_SUMMARY, payload: sitemapSignIn, meta: locationSignIn }
			]);
		});
	});
});
