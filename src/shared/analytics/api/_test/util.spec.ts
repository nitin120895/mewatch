import { expect } from 'chai';
import * as sinon from 'sinon';
import * as playerUtil from 'toggle/responsive/util/playerUtil';
import { getPageProperty, getPlatform } from 'shared/analytics/api/util';
import * as PageTemplates from 'shared/page/pageTemplate';

describe('getPageProperty', () => {
	describe('CLIENT_ANALYTICS_PROPERTY has content', () => {
		beforeEach(() => {
			process.env.CLIENT_ANALYTICS_PROPERTY = 'this is a sample value';
		});

		afterEach(() => {
			delete process.env.CLIENT_ANALYTICS_PROPERTY;
		});

		it('should return the default response if the host is not found', () => {
			expect(getPageProperty()).to.equal('this is a sample value');
		});
	});

	describe('CLIENT_ANALYTICS_PROPERTY does not have content', () => {
		beforeEach(() => {
			process.env.CLIENT_ANALYTICS_PROPERTY = '';
		});

		afterEach(() => {
			delete process.env.CLIENT_ANALYTICS_PROPERTY;
		});

		it('must not fail if the environment variable is empty', () => {
			expect(getPageProperty()).to.equal('mewatch');
		});
	});

	describe('CLIENT_ANALYTICS_PROPERTY is not set', () => {
		it('must not fail if the environment variable does not exist', () => {
			beforeEach(() => {
				delete process.env.CLIENT_ANALYTICS_PROPERTY;
			});

			expect(getPageProperty()).to.equal('mewatch');
		});
	});

	describe('getPlatform', () => {
		const specialPageTemplates = [
			PageTemplates.MovieDetail,
			PageTemplates.ProgramDetail,
			PageTemplates.ShowDetail,
			PageTemplates.ChannelDetail,
			PageTemplates.SeasonDetail,
			PageTemplates.EpisodeDetail,
			PageTemplates.Watch,
			PageTemplates.ItemDetail
		];
		const pageTemplatesKeys = Object.keys(PageTemplates);

		const pageTemplates = pageTemplatesKeys.map(key => {
			if (typeof PageTemplates[key] === 'string' && specialPageTemplates.indexOf(PageTemplates[key]) === -1) {
				return PageTemplates[key];
			}

			return false;
		});

		describe('Chromecast disabled', () => {
			let isCastConnected;

			beforeAll(() => {
				isCastConnected = sinon.stub(playerUtil, 'isCastConnected').returns(false);
			});

			afterAll(() => {
				isCastConnected.restore();
			});

			it("must return 'online' when Chromecast is not connected", () => {
				specialPageTemplates.forEach(pageTemplate => {
					expect(getPlatform(pageTemplate)).to.equal('online');
				});

				pageTemplates.forEach(pageTemplate => {
					expect(getPlatform(pageTemplate)).to.equal('online');
				});
			});
		});

		describe('Chromecast enabled', () => {
			let isCastConnected;

			beforeAll(() => {
				isCastConnected = sinon.stub(playerUtil, 'isCastConnected').returns(true);
				playerUtil.InitialPlayerService.setOriginalPlayer('cast');
			});

			afterAll(() => {
				isCastConnected.restore();
				playerUtil.InitialPlayerService.resetOriginalPlayer();
			});

			it("must return 'online' when Chromecast is connected to a non-playback related page", () => {
				pageTemplates.forEach(pageTemplate => {
					expect(getPlatform(pageTemplate)).to.equal('online');
				});
			});

			it("must return 'onlinechromecast' when Chromecast is connected to a playback related page", () => {
				specialPageTemplates.forEach(pageTemplate => {
					expect(getPlatform(pageTemplate)).to.equal('onlinechromecast');
				});
			});
		});
	});
});
