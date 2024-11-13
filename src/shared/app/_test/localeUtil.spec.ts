import configureStore from 'redux-mock-store';
import { expect } from 'chai';
import {
	getPrefixOfLanguage,
	getSupportedLanguage,
	getInitialLanguage,
	saveLanguagePreference,
	defaultLocale,
	setAvailableLocales
} from '../localeUtil';
import DeviceModel from 'shared/util/platforms/deviceModel';

describe('localeUtil', () => {
	describe('getPrefixOfLanguage', () => {
		it('should get prefix of language code', () => {
			const languageCodes = ['en', 'en-US', 'zh', 'zh-CN', 'zh-cn', 'fr', ''];
			const prefixOfLanguageCodes = ['en', 'en', 'zh', 'zh', 'zh', 'fr', ''];
			expect(languageCodes.map(getPrefixOfLanguage)).to.deep.equal(prefixOfLanguageCodes);
		});
	});

	describe('getSupportedLanguage', () => {
		it('should get the supported language code that validated by "availableLocales" set here', () => {
			setAvailableLocales(['en', 'zh-CN']);
			const targetLanguages = ['en', 'en-US', 'zh', 'zh-CN', 'zh-cn', 'ar', 'ar-AE', ''];
			const supportedTargetLanguages = ['en', 'en', 'zh-CN', 'zh-CN', 'zh-CN', undefined, undefined, undefined];
			const validatedLanguages = targetLanguages.map(getSupportedLanguage);
			expect(validatedLanguages).to.deep.equal(supportedTargetLanguages);
		});
	});

	describe('getSupportedLanguage', () => {
		it('should get the supported language code that validated by "availableLocales" set here', () => {
			setAvailableLocales(['en', 'zh-cn']);
			const targetLanguages = ['en', 'en-US', 'zh', 'zh-CN', 'zh-cn', 'ar', 'ar-AE', ''];
			const supportedTargetLanguages = ['en', 'en', 'zh-cn', 'zh-cn', 'zh-cn', undefined, undefined, undefined];
			const validatedLanguages = targetLanguages.map(getSupportedLanguage);
			expect(validatedLanguages).to.deep.equal(supportedTargetLanguages);
		});
	});

	describe('getInitialLanguage', () => {
		const deviceInfo = {
			getId: () => Promise.resolve(''),
			getLanguage: () => Promise.resolve('zh-CN'),
			name: '',
			type: ''
		};
		DeviceModel.deviceInfo = () => deviceInfo;

		describe('should get the lang stored in Redux State or defaultLocale', () => {
			// ensure there is no supported lang stored in cookies, either get device language error or not supported.
			saveLanguagePreference(undefined);
			deviceInfo.getLanguage = () => Promise.resolve('');

			it('should get supported language from state', async () => {
				setAvailableLocales(['en', 'zh-CN']);
				const store = configureStore()({
					app: {
						i18n: { lang: 'zh' }
					}
				});
				const initialLanguage = await getInitialLanguage(store.getState() as state.Root);
				expect(initialLanguage).to.deep.equal('zh-CN');
			});

			it('should get supported language from state', async () => {
				setAvailableLocales(['en', 'zh-cn']);
				const store = configureStore()({
					app: {
						i18n: { lang: 'zh' }
					}
				});
				const initialLanguage = await getInitialLanguage(store.getState() as state.Root);
				expect(initialLanguage).to.deep.equal('zh-cn');
			});

			it('should get the defaultLocale value because "" is not supported', async () => {
				const store = configureStore()({
					app: {
						i18n: { lang: '' }
					}
				});
				const initialLanguage = await getInitialLanguage(store.getState() as state.Root);
				expect(initialLanguage).to.deep.equal(defaultLocale);
			});

			it('should get the defaultLocale value because "fr" is not supported', async () => {
				const store = configureStore()({
					app: {
						i18n: { lang: 'fr' }
					}
				});
				const initialLanguage = await getInitialLanguage(store.getState() as state.Root);
				expect(initialLanguage).to.deep.equal(defaultLocale);
			});

			it('should get the defaultLocale value because "ar-AE" is not supported.', async () => {
				const store = configureStore()({
					app: {
						i18n: { lang: 'ar-AE' }
					}
				});
				const initialLanguage = await getInitialLanguage(store.getState() as state.Root);
				expect(initialLanguage).to.deep.equal(defaultLocale);
			});
		});

		describe('should get the lang stored in cookies or defaultLocale', () => {
			// ensure there is no supported lang stored in Redux state, either get device language error or not supported.
			const store = configureStore()({
				app: {
					i18n: { lang: '' }
				}
			});
			const state: state.Root = store.getState() as state.Root;
			saveLanguagePreference(undefined);

			it('should get the lang stored in cookies', async () => {
				saveLanguagePreference('en');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('en');
			});

			it('should get the lang stored in cookies', async () => {
				saveLanguagePreference('en-US');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('en');
			});

			it('should get the lang stored in cookies', async () => {
				saveLanguagePreference('zh');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('zh-cn');
			});

			it('should get the lang stored in cookies', async () => {
				setAvailableLocales(['en', 'zh-CN']);
				saveLanguagePreference('zh-cn');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('zh-CN');
			});

			it('should get the lang stored in cookies', async () => {
				setAvailableLocales(['en', 'zh-cn']);
				saveLanguagePreference('zh-CN');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('zh-cn');
			});

			it('should get the lang from defaultLocale', async () => {
				saveLanguagePreference('ar');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal(defaultLocale);
			});

			it('should get the lang from defaultLocale', async () => {
				saveLanguagePreference('ar-AE');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal(defaultLocale);
			});
		});

		describe('should get the lang from device or defaultLocale', () => {
			// ensure there is no supported lang stored in Redux state, either get saved language error or not supported.
			const store = configureStore()({
				app: {
					i18n: { lang: '' }
				}
			});
			const state: state.Root = store.getState() as state.Root;
			saveLanguagePreference(undefined);

			it('device language is en', async () => {
				deviceInfo.getLanguage = () => Promise.resolve('en');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('en');
			});

			it('device language is en-US', async () => {
				deviceInfo.getLanguage = () => Promise.resolve('en-US');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('en');
			});

			it('device language is zh-cn', async () => {
				setAvailableLocales(['en', 'zh-CN']);
				deviceInfo.getLanguage = () => Promise.resolve('zh-cn');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('zh-CN');
			});

			it('device language is zh-CN', async () => {
				setAvailableLocales(['en', 'zh-cn']);
				deviceInfo.getLanguage = () => Promise.resolve('zh-CN');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('zh-cn');
			});

			it('device language is zh', async () => {
				deviceInfo.getLanguage = () => Promise.resolve('zh');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal('zh-cn');
			});

			it('device language is not supported', async () => {
				deviceInfo.getLanguage = () => Promise.resolve('ar');
				const initialLanguage = await getInitialLanguage(state);
				expect(initialLanguage).to.deep.equal(defaultLocale);
			});
		});
	});
});
