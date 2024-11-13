import {
	UPDATE_LOCALE,
	HARD_REFRESH,
	updateLocale,
	hardRefresh,
	UPDATE_LOCALE_START,
	UPDATE_LOCALE_END
} from '../appWorkflow';
import { GET_APP_CONFIG } from 'shared/service/action/app';
import reducer from '../appWorkflow';
import { expect } from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as app from 'shared/service/action/app';
import * as pageWorkflow from 'shared/page/pageWorkflow';
import * as persistentCache from 'shared/cache/persistentCache';
import * as Locale from '../localeUtil';
import { addLocaleData } from 'react-intl';
import * as fr from 'react-intl/locale-data/fr';
import * as sinon from 'sinon';

describe('appWorkflow', () => {
	describe('reduceApp', () => {
		it('should reduce UPDATE_LOCALE action into state', () => {
			const payload = { lang: 'fr', strings: { title: 'App' } };
			const action = { type: UPDATE_LOCALE, payload };
			const initialState = reducer(undefined, { type: '' });
			const state: state.App = reducer(undefined, action);
			expect(state).to.deep.equal({
				...initialState,
				i18n: {
					// should only merge it in
					...state.i18n,
					...payload
				},
				contentFilters: {
					device: process.env.CLIENT_DEVICE_PLATFORM
				}
			});
		});

		it('should reduce GET_APP_CONFIG action into state', () => {
			const payload = {
				subscription: {},
				classification: {},
				sitemap: [],
				navigation: {
					header: []
				},
				general: {},
				i18n: { languages: [] }
			};

			const action = { type: GET_APP_CONFIG, payload };
			const initialState = reducer(undefined, { type: '' });
			const state: state.App = reducer(undefined, action);

			expect(state).to.deep.equal({
				...initialState,
				config: payload,
				i18n: {
					...initialState.i18n,
					languages: payload.i18n.languages
				},
				contentFilters: {
					device: process.env.CLIENT_DEVICE_PLATFORM,
					segments: ['all']
				}
			});
		});
	});

	describe('updateLocale', () => {
		it('should dispatch actions for locale change', () => {
			const store = configureStore([thunk])({
				app: {
					i18n: {
						lang: 'en',
						strings: 'strings',
						loading: false
					}
				}
			});
			const localeStub = sinon.stub(Locale, 'setLocale').callsFake(() => {
				store.dispatch({ type: 'UPDATE_LOCALE_STUB' });
				return Promise.resolve({});
			});
			store.dispatch(updateLocale('fr', true));
			addLocaleData(fr);
			expect(store.getActions()).to.deep.equal([{ type: UPDATE_LOCALE_START }, { type: 'UPDATE_LOCALE_STUB' }]);
			localeStub.restore();
		});
	});

	describe('hardRefresh', () => {
		it('should dispatch actions to hard refresh the application', done => {
			const store = configureStore([thunk])({
				page: {
					history: { entries: [], index: 0, location: <any>{}, pageSummary: {} }
				},
				app: { config: { sitemap: [] } }
			});
			const appStub = sinon.stub(app, 'getAppConfig').callsFake(() => {
				return () => {
					store.dispatch({ type: 'GET_APP_CONFIG_STUB' });
					return Promise.resolve();
				};
			});

			const clearCacheStub = sinon.stub(persistentCache, 'clearServiceCache').callsFake(() => {
				return Promise.resolve();
			});

			const pageWorkflowStub = sinon.stub(pageWorkflow, 'refreshPage').callsFake(() => {
				return () => Promise.resolve();
			});
			store.dispatch(hardRefresh()).then(() => {
				const actions = store.getActions();
				expect(actions).to.deep.equal([
					{ type: HARD_REFRESH },
					{ type: 'GET_APP_CONFIG_STUB' },
					{ type: UPDATE_LOCALE_END }
				]);

				appStub.restore();
				clearCacheStub.restore();
				pageWorkflowStub.restore();

				done();
			});
		});
	});
});
