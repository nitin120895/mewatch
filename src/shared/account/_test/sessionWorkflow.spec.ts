import configureStore from 'redux-mock-store';
import reduceSession from '../sessionWorkflow';
import { SIGN_OUT, signIn, signOut } from '../sessionWorkflow';
import { PAGE_CHANGE } from '../../page/pageWorkflow';
import { GET_ACCOUNT_TOKEN, GET_PROFILE_TOKEN, REFRESH_TOKEN } from '../../service/action/authorization';
import { expect } from 'chai';
import thunk from 'redux-thunk';
import * as appWorkflow from 'shared/app/appWorkflow';
import * as profileWorkflow from 'shared/account/profileWorkflow';
import * as sinon from 'sinon';
import * as authorization from 'shared/service/action/authorization';
import * as serviceAuth from 'shared/service/authorization';
import * as serviceAccount from 'shared/service/account';
import * as account from 'shared/service/action/account';
import * as profile from 'shared/service/action/profile';
import * as anonymous from 'shared/service/action/anonymous';
import * as accountWorkflow from 'shared/account/accountWorkflow';
import { GET_DEVICES } from 'shared/service/action/account';
import * as deviceUtil from 'shared/util/deviceUtil';

describe('sessionWorkflow', () => {
	describe('reduceSession', () => {
		it('should reduce PAGE_CHANGE action into state', () => {
			const action: Action<any> = { type: PAGE_CHANGE };
			const state: state.Session = reduceSession(undefined, action);
			expect(state).to.deep.equal({
				tokens: [],
				remember: false
			});
		});

		it('should reduce GET_ACCOUNT_TOKEN action into state', () => {
			const payload: api.AccessToken[] = [
				{
					value:
						'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJhdWQiOiJodHRwczovL2Fwb2xsby5tYXNzaXZpc2lvbi5jb20vSVNML0FwaS9WMS9EYXRhc2VydmljZSIsInN1YiI6IkNhdGFsb2ciLCJleHAiOjE0NjcyNzg3NDYsInVzZXJBY2NvdW50SWQiOiIxNmU0NzM2Mi04YjNlLWU2MTEtODEwYy0wMmZhNTVlNTZhOTkiLCJ1c2VyUHJvZmlsZUlkIjoiMWNlNDczNjItOGIzZS1lNjExLTgxMGMtMDJmYTU1ZTU2YTk5IiwiZW1haWwiOiJkb21ldHQueGluZ0BtYXNzaXZlLmNvIiwiZGV2aWNlIjoid2ViX2Jyb3dzZXJfbWFjIn0.ohHwKOp3xcczRRHC5MZjLFVwRy1F-s0h_eBHP1uqq5mS2QAn2MxA4DC4BaRqw3HOWSEtya6r6nV3MyVjIv1iEnSrBLuwQ2_vGM3V8TuZFHBtrF5OLOBwL-tBjaEMR8FRwhK_7JXheclDoqFqpsVAPgrHtPjcP09nCWUrXBiVsDtemn81r3rEYumY773hdqRuGJQrTgoplhjdSSEDyF0uzyXM7pylymLVRHKg2j8rd6F4M7YdSWCXebKJszmE7UTwDL2OUAFdneTVM3veCaEB3jVvf9uDXq0n1b94Ku-Yw82Zd-JVEot52lDdYkXosI-sAstc0slriDG_dh0oX1W5xA',
					refreshable: true,
					expirationDate: new Date(Date.now() + 1000000),
					type: 'UserAccount'
				}
			];
			const action: Action<any> = { type: GET_ACCOUNT_TOKEN, payload };
			const state: state.Session = reduceSession(undefined, action);
			expect(state).to.deep.equal({
				tokens: payload,
				remember: false
			});
		});

		it('should reduce GET_PROFILE_TOKEN action into state', () => {
			const payload: api.AccessToken[] = [
				{
					value:
						'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJhdWQiOiJodHRwczovL2Fwb2xsby5tYXNzaXZpc2lvbi5jb20vSVNML0FwaS9WMS9EYXRhc2VydmljZSIsInN1YiI6IkNhdGFsb2ciLCJleHAiOjE0NjcyNzg3NDYsInVzZXJBY2NvdW50SWQiOiIxNmU0NzM2Mi04YjNlLWU2MTEtODEwYy0wMmZhNTVlNTZhOTkiLCJkZWZhdWx0VXNlclByb2ZpbGVJZCI6IjFjZTQ3MzYyLThiM2UtZTYxMS04MTBjLTAyZmE1NWU1NmE5OSIsInVzZXJQcm9maWxlSWQiOiIxY2U0NzM2Mi04YjNlLWU2MTEtODEwYy0wMmZhNTVlNTZhOTkiLCJlbWFpbCI6ImRvbWV0dC54aW5nQG1hc3NpdmUuY28iLCJmaXJzdExvZ2luRGF0ZSI6MTQ2NzI2Nzk0NiwibGFzdExvZ2luRGF0ZSI6MTQ2NzI2NzkwNiwic2Vzc2lvbkRhdGUiOjE0NjcyNjc5NDYsInNlc3Npb25Db3VudCI6MSwiZGV2aWNlIjoid2ViX2Jyb3dzZXJfbWFjIn0.KbW0avxaTPXOmGktvfZg53Yxd16DdI5UqCiTo6Un-765-j1oRxQHlm1pL610AjZ39JR39wq3Saxw_HVvdzQVk5UWbaIJnOD9phHATq1D_2JGA8-mQyklgpFHLhZT0Jp8IEpbASnrgKcOfzVvltEykrFFSfgaTwzh_w3WsxflFWs4LGOYgn985biOYFSmbawzV7q3MhIGLSM49sczJhLDaTokAuFHAXaTRF20OYRC5qXJh-Z2LBRhP37Mh5qW5miXT77znLZIiWrIUerkawyCZmvnIrolBCTG92y_S89LYK6HfPrh4oWVBlB1OhXcJxm0M8XjkxJU7_pY8YAR3ZMhwg',
					refreshable: true,
					expirationDate: new Date(Date.now() + 1000000),
					type: 'UserProfile'
				}
			];
			const action: Action<any> = { type: GET_PROFILE_TOKEN, payload };
			const state: state.Session = reduceSession(undefined, action);
			expect(state).to.deep.equal({
				tokens: payload,
				remember: false
			});
		});

		it('should reduce REFRESH_TOKEN action into state', () => {
			const payload: api.AccessToken[] = [
				{
					value:
						'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJhdWQiOiJodHRwczovL2Fwb2xsby5tYXNzaXZpc2lvbi5jb20vSVNML0FwaS9WMS9EYXRhc2VydmljZSIsInN1YiI6IkNhdGFsb2ciLCJleHAiOjE0NjcyNzg3NDYsInVzZXJBY2NvdW50SWQiOiIxNmU0NzM2Mi04YjNlLWU2MTEtODEwYy0wMmZhNTVlNTZhOTkiLCJkZWZhdWx0VXNlclByb2ZpbGVJZCI6IjFjZTQ3MzYyLThiM2UtZTYxMS04MTBjLTAyZmE1NWU1NmE5OSIsInVzZXJQcm9maWxlSWQiOiIxY2U0NzM2Mi04YjNlLWU2MTEtODEwYy0wMmZhNTVlNTZhOTkiLCJlbWFpbCI6ImRvbWV0dC54aW5nQG1hc3NpdmUuY28iLCJmaXJzdExvZ2luRGF0ZSI6MTQ2NzI2Nzk0NiwibGFzdExvZ2luRGF0ZSI6MTQ2NzI2NzkwNiwic2Vzc2lvbkRhdGUiOjE0NjcyNjc5NDYsInNlc3Npb25Db3VudCI6MSwiZGV2aWNlIjoid2ViX2Jyb3dzZXJfbWFjIn0.KbW0avxaTPXOmGktvfZg53Yxd16DdI5UqCiTo6Un-765-j1oRxQHlm1pL610AjZ39JR39wq3Saxw_HVvdzQVk5UWbaIJnOD9phHATq1D_2JGA8-mQyklgpFHLhZT0Jp8IEpbASnrgKcOfzVvltEykrFFSfgaTwzh_w3WsxflFWs4LGOYgn985biOYFSmbawzV7q3MhIGLSM49sczJhLDaTokAuFHAXaTRF20OYRC5qXJh-Z2LBRhP37Mh5qW5miXT77znLZIiWrIUerkawyCZmvnIrolBCTG92y_S89LYK6HfPrh4oWVBlB1OhXcJxm0M8XjkxJU7_pY8YAR3ZMhwg',
					refreshable: true,
					expirationDate: new Date(Date.now() + 1000000),
					type: 'UserProfile'
				}
			];
			const action: Action<any> = { type: REFRESH_TOKEN, payload };
			const state: state.Session = reduceSession(undefined, action);
			expect(state).to.deep.equal({
				tokens: payload,
				remember: false
			});
		});

		it('should reduce SIGN_OUT action into state', () => {
			const action: Action<any> = { type: SIGN_OUT };
			const state: state.Session = reduceSession(undefined, action);
			expect(state).to.deep.equal({
				tokens: []
			});
		});
	});

	describe('signIn', () => {
		it('should dispatch actions to sign in', done => {
			const store = configureStore([thunk])({});

			const sessionWorkflowStub = sinon.stub(authorization, 'getAccountToken').callsFake(() => {
				return () => {
					store.dispatch({ type: 'GET_ACCOUNT_TOKEN_STUB' });
					return Promise.resolve('action');
				};
			});

			const remindersStub = sinon.stub(profile, 'getReminders').callsFake(() => {
				return () => {
					store.dispatch({ type: 'GET_REMINDERS_STUB' });
					return Promise.resolve();
				};
			});
			const accountStub = sinon.stub(account, 'getAccount').callsFake(() => {
				return () => {
					store.dispatch({ type: 'GET_ACCOUNT_STUB' });
					return Promise.resolve();
				};
			});
			const profileStub = sinon.stub(profile, 'getProfile').callsFake(() => {
				return () => {
					store.dispatch({ type: 'GET_PROFILE_STUB' });
					return Promise.resolve();
				};
			});
			const appWorkflowStub = sinon.stub(appWorkflow, 'hardRefresh').callsFake(() => {
				return () => {
					store.dispatch({ type: 'HARD_REFRESH_STUB' });
				};
			});

			const removeAnonymousProfileStub = sinon
				.stub(profileWorkflow, 'removeAnonymousProfile')
				.callsFake(() => ({ type: 'REMOVE_ANONYMOUS_PROFILE_STUB' }));

			store.dispatch(signIn('email', 'password', false, ['Catalog'])).then(() => {
				expect(store.getActions()).to.deep.equal([
					{ type: 'GET_ACCOUNT_TOKEN_STUB' },
					{ type: 'REMOVE_ANONYMOUS_PROFILE_STUB' },
					{ type: 'session/SIGN_IN' },
					{ type: 's/account/REGISTER_DEVICE_START', meta: { info: undefined } }
				]);

				sessionWorkflowStub.restore();
				accountStub.restore();
				profileStub.restore();
				remindersStub.restore();
				appWorkflowStub.restore();
				removeAnonymousProfileStub.restore();

				done();
			});
		});
	});

	describe('signOut', () => {
		it('should dispatch actions to sign out', done => {
			const signOutStub = sinon.stub(serviceAuth, 'signOut').callsFake(() => Promise.resolve({} as api.Response<any>));
			const appWorkflowStub = sinon.stub(appWorkflow, 'hardRefresh').callsFake(() => {
				return { type: 'HARD_REFRESH_STUB' };
			});
			const deRegisteringDevice = sinon
				.stub(serviceAccount, 'deregisterDevice')
				.callsFake(() => Promise.resolve({} as api.Response<any>));

			const getDevices = sinon.stub(account, 'getDevices').callsFake(() => ({ type: GET_DEVICES }));

			const getDeviceId = sinon.stub(deviceUtil, 'isDeviceInList').returns(true);

			const getAllDevices = sinon.stub(accountWorkflow, 'getAllDevices').callsFake(() => {
				return dispatch => Promise.resolve({});
			});

			const getAnonymousTokenStub = sinon.stub(authorization, 'getAnonymousToken').callsFake(() => {
				return () => {
					store.dispatch({ type: 'GET_ANONYMOUS_TOKEN_STUB' });
					return Promise.resolve();
				};
			});

			const getProfileAnonymousStub = sinon
				.stub(profileWorkflow, 'getProfileAnonymous')
				.callsFake(() => ({ type: profileWorkflow.GET_PROFILE_ANONYMOUS }));

			const getWatchedAnonymousStub = sinon.stub(anonymous, 'getWatchedAnonymous').callsFake(() => {
				return () => {
					store.dispatch({ type: 'GET_WATCHED_ANONYMOUS_STUB' });
					return Promise.resolve();
				};
			});

			const store = configureStore([thunk])({ session: { tokens: [] } });

			store.dispatch(signOut()).then(() => {
				expect(store.getActions()).to.deep.equal([
					{ type: 's/account/DEREGISTER_DEVICE_START', meta: { info: undefined } },
					{
						type: 's/account/DEREGISTER_DEVICE',
						payload: undefined,
						error: undefined,
						meta: { res: undefined, info: undefined }
					},
					{ type: 'session/CLEAR_SESSION_CONTENT_FILTERS' },
					{ type: 'session/SIGN_OUT', payload: false },
					{ type: 'HARD_REFRESH_STUB' },
					// sign in as anonymous
					{ type: 'GET_ANONYMOUS_TOKEN_STUB' },
					{ type: 'profile/GET_PROFILE_ANONYMOUS' },
					{ type: 'GET_WATCHED_ANONYMOUS_STUB' }
				]);

				signOutStub.restore();
				appWorkflowStub.restore();
				deRegisteringDevice.restore();
				getAllDevices.restore();
				getDeviceId.restore();
				getDevices.restore();
				getAnonymousTokenStub.restore();
				getProfileAnonymousStub.restore();
				getWatchedAnonymousStub.restore();
				done();
			});
		});
	});
});
