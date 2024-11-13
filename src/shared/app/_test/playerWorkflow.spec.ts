import reducer from '../playerWorkflow';
import { expect } from 'chai';
import { INIT_PLAYER_STATE, VOLUME_SAVE, OPEN_PLAYER, CLOSE_PLAYER, RELATED_ITEMS } from '../playerWorkflow';
import { DEFAULT_PLAYBACK_SPEED, OPTION_LABEL_OFF } from 'shared/app/localeUtil';

describe('playerWorkflow', () => {
	describe('reducePlayer', () => {
		it('should reduce INIT_PLAYER_STATE action into state', () => {
			const payload = { volume: 0.3, maxDRMResolution: 'External' };
			const action = { type: INIT_PLAYER_STATE, payload };
			const initialState = reducer(undefined, { type: '' });
			const state: state.Player = reducer(undefined, action);
			expect(state).to.deep.equal({
				...initialState,
				volume: 0.3,
				maxDRMResolution: 'External'
			});
		});

		it('check state after INIT_PLAYER_STATE has no players', () => {
			const payload = { volume: 0 };
			const action = { type: INIT_PLAYER_STATE, payload };
			const state: state.Player = reducer(undefined, action);
			expect(state.players).is.empty;
		});

		it('should reduce VOLUME_SAVE action into state', () => {
			const payload = 1;
			const action = { type: VOLUME_SAVE, payload };
			const initialState = reducer(undefined, { type: '' });
			const state: state.Player = reducer(undefined, action);
			expect(state).to.deep.equal({
				...initialState,
				volume: 1
			});
		});

		it('should reduce OPEN_PLAYER action without data and error into state', () => {
			const payload = {
				site: 'abcde'
			};
			const action = { type: OPEN_PLAYER, payload };
			const initialState = reducer(undefined, { type: '' });
			const state: state.Player = reducer(undefined, action);
			expect(state).to.deep.equal({
				...initialState,
				players: {
					abcde: payload
				},
				startoverProgram: undefined
			});
			expect(state.players[payload.site].data).is.undefined;
			expect(state.players[payload.site].error).is.undefined;
		});

		it('should reduce OPEN_PLAYER action with data into state', () => {
			const payload = {
				site: 'abcde',
				data: [
					{
						name: 'media',
						deliveryType: 'Progressive',
						url: 'test url',
						drm: 'widevine',
						format: 'test format',
						resolution: 'HD-1080',
						width: 1920,
						height: 1080,
						language: 'en'
					}
				]
			};
			const action = { type: OPEN_PLAYER, payload };
			const initialState = reducer(undefined, { type: '' });
			const state: state.Player = reducer(undefined, action);
			expect(state).to.deep.equal({
				...initialState,
				players: {
					abcde: {
						...payload,
						data: [payload.data[0]]
					}
				},
				startoverProgram: undefined
			});
			expect(state.players[payload.site].data[0].drm).to.equal(payload.data[0].drm);
		});

		it('should reduce OPEN_PLAYER action with error into state', () => {
			const payload = {
				site: 'abcde',
				error: true
			};
			const action = { type: OPEN_PLAYER, payload };
			const initialState = reducer(undefined, { type: '' });
			const state: state.Player = reducer(undefined, action);
			expect(state).to.deep.equal({
				...initialState,
				players: {
					abcde: {
						site: 'abcde',
						error: true
					}
				},
				startoverProgram: undefined
			});
			expect(state.players[payload.site].error).is.true;
		});

		it('should reduce CLOSE_PLAYER action into state', () => {
			const initialState = {
				volume: 1,
				players: {
					abcde: {
						site: 'abcde'
					}
				},
				realVideoPosition: undefined,
				cast: undefined,
				fullscreen: false,
				fullscreenEmulation: false,
				channelSelectorVisible: false,
				thumbnailVisible: false,
				startover: false,
				isInitialised: false,
				isMuted: false,
				muteInteraction: false,
				activeSubtitleLang: OPTION_LABEL_OFF,
				selectedPlaybackSpeed: DEFAULT_PLAYBACK_SPEED,
				tokenClassification: undefined,
				currentTime: 0,
				isSessionValid: false,
				sessionExpiredTimeout: undefined,
				iOSExpiryTimestamp: undefined
			};
			const payload = 'abcde';
			const action = { type: CLOSE_PLAYER, payload };
			const state = reducer(initialState, action);
			expect(state.players).is.empty;
		});

		it('should reduce RELATED_ITEMS action into state', () => {
			const relatedItemsData: api.ItemList = {
				id: 'id',
				key: 'key',
				path: 'path',
				size: 10,
				items: [],
				paging: {
					page: 1,
					total: 10
				}
			};

			const initialState = {
				volume: 1,
				players: {
					abcde: {
						site: 'abcde'
					}
				},
				realVideoPosition: undefined,
				cast: undefined,
				fullscreen: false,
				fullscreenEmulation: false,
				channelSelectorVisible: false,
				thumbnailVisible: false,
				startover: false,
				isInitialised: false,
				isMuted: false,
				muteInteraction: false,
				activeSubtitleLang: OPTION_LABEL_OFF,
				selectedPlaybackSpeed: DEFAULT_PLAYBACK_SPEED,
				tokenClassification: undefined,
				currentTime: 0,
				isSessionValid: false,
				sessionExpiredTimeout: undefined,
				iOSExpiryTimestamp: undefined
			};

			const payload = {
				site: 'abcde',
				relatedItems: relatedItemsData
			};

			const action = { type: RELATED_ITEMS, payload };
			const state: state.Player = reducer(initialState, action);
			expect(state).to.deep.equal({
				...initialState,
				players: {
					abcde: {
						site: 'abcde',
						relatedItems: payload.relatedItems
					}
				}
			});
		});
	});
});
