import { expect } from 'chai';
import * as analyticsPath from 'shared/analytics/util/analyticsPath';
import * as analyticsPathMock from './analyticsPathMock';
import { EpisodeRange } from 'toggle/responsive/pageEntry/utils/episodeRange';
import { EpisodeSortingOrder } from 'toggle/responsive/pageEntry/itemDetail/d2/EpisodeSortingSelector';
import { RANGE_OPTION_ALL } from 'toggle/responsive/pageEntry/itemDetail/d2/EpisodeRangeSelector';

describe('Paths should meet the spec', () => {
	describe('Subscriptions', () => {
		it('subscriptionPlanPath', () => {
			expect(analyticsPath.subscriptionPlanPath(undefined)).to.be.undefined;
			expect(analyticsPath.subscriptionPlanPath(analyticsPathMock.mockPricePlan as api.PricePlan)).to.equal(
				'/-view-plan-11012'
			);
		});

		it('subscriptionPaymentSummaryPath', () => {
			expect(analyticsPath.subscriptionPaymentSummaryPath(undefined)).to.be.undefined;
			expect(analyticsPath.subscriptionPaymentSummaryPath(analyticsPathMock.mockPricePlan as api.PricePlan)).to.equal(
				'/-payment-summary-11012'
			);
		});

		it('subscriptionPaymentMethodPath', () => {
			expect(analyticsPath.subscriptionPaymentMethodPath(undefined)).to.be.undefined;
			expect(analyticsPath.subscriptionPaymentMethodPath(analyticsPathMock.mockPricePlan as api.PricePlan)).to.equal(
				'/-payment-method-11012'
			);
		});

		it('subscriptionPaymentSuccessPath', () => {
			expect(analyticsPath.subscriptionPaymentSuccessPath(undefined)).to.be.undefined;
			expect(analyticsPath.subscriptionPaymentSuccessPath('123123')).to.equal('/-payment-success-123123');
		});

		it('subscriptionPaymentSuccessPath', () => {
			expect(analyticsPath.subscriptionPaymentFailedPath(undefined)).to.be.undefined;
			expect(analyticsPath.subscriptionPaymentFailedPath('123123')).to.equal('/-payment-fail-123123');
		});
	});

	describe('Search', () => {
		it('Language Code', () => {
			expect(analyticsPath.searchLanguagePath(undefined)).to.be.undefined;
			expect(analyticsPath.searchLanguagePath('en')).to.equal('/_en');
		});
	});

	describe('List Detail Page', () => {
		it('getListDetailsLanguage', () => {
			expect(analyticsPath.getListDetailsLanguage('all languages')).to.equal('AllLanguages');
			expect(analyticsPath.getListDetailsLanguage('All Languages')).to.equal('AllLanguages');
			expect(analyticsPath.getListDetailsLanguage('eNGliSH')).to.equal('English');
			expect(analyticsPath.getListDetailsLanguage('chinese')).to.equal('Chinese');
			expect(analyticsPath.getListDetailsLanguage('Catalin')).to.equal('Catalin');
		});

		it('getListDetailsGenre', () => {
			expect(analyticsPath.getListDetailsGenre('all genres')).to.equal('AllGenres');
			expect(analyticsPath.getListDetailsGenre('All Genres')).to.equal('AllGenres');
			expect(analyticsPath.getListDetailsGenre('eNGliSH')).to.equal('English');
			expect(analyticsPath.getListDetailsGenre('chinese')).to.equal('Chinese');
			expect(analyticsPath.getListDetailsGenre('Catalin')).to.equal('Catalin');
		});

		it('getListDetailsLangauge', () => {
			expect(analyticsPath.getListDetailsClassification('All Classifications')).to.equal('AllClassifications');
			expect(analyticsPath.getListDetailsClassification('g - pg')).to.equal('g-pg');
			expect(analyticsPath.getListDetailsClassification('G - PG')).to.equal('G-PG');
		});

		it('getListDetailsSort', () => {
			expect(analyticsPath.getListDetailsSort('latest-release')).to.equal('LatestRelease');
			expect(analyticsPath.getListDetailsSort('earliest-release')).to.equal('EarliestRelease');
			expect(analyticsPath.getListDetailsSort('a-z')).to.equal('A-Z');
			expect(analyticsPath.getListDetailsSort('z-a')).to.equal('Z-A');
		});

		it('Applied Filter', () => {
			expect(analyticsPath.listDetailsPath('All Languages', 'All Ratings', 'latest-release', 'All Genre')).to.equal(
				'//AllLanguages_AllRatings_LatestRelease_AllGenre'
			);

			expect(analyticsPath.listDetailsPath('All Languages', 'All Ratings', 'earliest-release', 'All Genre')).to.equal(
				'//AllLanguages_AllRatings_EarliestRelease_AllGenre'
			);

			expect(analyticsPath.listDetailsPath('All Languages', 'All Ratings', 'a-z', 'All Genre')).to.equal(
				'//AllLanguages_AllRatings_A-Z_AllGenre'
			);
			// expect(analyticsPath.listDetailsPath('English')).to.be('//English');
		});
	});

	describe('Item Detail Page', () => {
		it('No params provided', () => {
			expect(analyticsPath.itemDetailPath()).to.equal('/');
		});

		function createRange(from: number, to: number, key: string): EpisodeRange {
			return {
				from,
				to,
				key
			};
		}

		it('List Start and List End provided, Earliest as sorting order', () => {
			const tests = [
				{
					range: createRange(1, 2, '1-2'),
					sort: EpisodeSortingOrder.earliest,
					expected: '//1-2_Earliest'
				},
				{
					range: createRange(100, 2, '100-2'),
					sort: EpisodeSortingOrder.earliest,
					expected: '//100-2_Earliest'
				},
				{
					range: createRange(-1, -20000, '-1--20000'),
					sort: EpisodeSortingOrder.earliest,
					expected: '//-1--20000_Earliest'
				}
			];

			tests.forEach(test => {
				expect(analyticsPath.itemDetailPath(test.range, test.sort)).to.equal(test.expected);
			});
		});

		it('List Start and List End provided, Latest as sorting order', () => {
			const tests = [
				{
					range: createRange(1, 2, '1-2'),
					sort: EpisodeSortingOrder.latest,
					expected: '//1-2_Latest'
				},
				{
					range: createRange(100, 2, '100-2'),
					sort: EpisodeSortingOrder.latest,
					expected: '//100-2_Latest'
				},
				{
					range: createRange(-1, -20000, '-1--20000'),
					sort: EpisodeSortingOrder.latest,
					expected: '//-1--20000_Latest'
				}
			];

			tests.forEach(test => {
				expect(analyticsPath.itemDetailPath(test.range, test.sort)).to.equal(test.expected);
			});
		});

		it('All Episodes Range, Earliest as sorting order', () => {
			const tests = [
				{
					range: createRange(1, 2, RANGE_OPTION_ALL),
					sort: EpisodeSortingOrder.earliest,
					expected: '//AllEpisodes_Earliest'
				},
				{
					range: createRange(100, 2, RANGE_OPTION_ALL),
					sort: EpisodeSortingOrder.earliest,
					expected: '//AllEpisodes_Earliest'
				},
				{
					range: createRange(-1, -20000, RANGE_OPTION_ALL),
					sort: EpisodeSortingOrder.earliest,
					expected: '//AllEpisodes_Earliest'
				}
			];

			tests.forEach(test => {
				expect(analyticsPath.itemDetailPath(test.range, test.sort)).to.equal(test.expected);
			});
		});

		it('All Episodes Range, Latest as sorting order', () => {
			const tests = [
				{
					range: createRange(1, 2, RANGE_OPTION_ALL),
					sort: EpisodeSortingOrder.latest,
					expected: '//AllEpisodes_Latest'
				},
				{
					range: createRange(100, 2, RANGE_OPTION_ALL),
					sort: EpisodeSortingOrder.latest,
					expected: '//AllEpisodes_Latest'
				},
				{
					range: createRange(-1, -20000, RANGE_OPTION_ALL),
					sort: EpisodeSortingOrder.latest,
					expected: '//AllEpisodes_Latest'
				}
			];

			tests.forEach(test => {
				expect(analyticsPath.itemDetailPath(test.range, test.sort)).to.equal(test.expected);
			});
		});
	});

	describe('EPG', () => {
		it('EPG Schedule', () => {
			const today = new Date();
			const monthLabel = `${today.getMonth() + 1}`.padStart(2, '0');
			const dayLabel = `${today.getDate()}`.padStart(2, '0');
			const todayDateLabel = `${dayLabel}${monthLabel}`;
			const thursday = new Date(2020, 5, 11, 8, 10);
			const friday = new Date(2020, 5, 12, 9, 0);
			const saturday = new Date(2020, 5, 13, 10, 0);
			const sunday = new Date(2020, 5, 14, 11, 0);
			const monday = new Date(2020, 5, 15, 12, 0);
			const tuesday = new Date(2020, 5, 16, 13, 0);
			const wednesday = new Date(2020, 5, 17, 14, 0);

			const title = 'meWatch EPG Schedule';

			expect(analyticsPath.epgSchedulePath(today, title)).to.equal(
				'//TODAY-' + todayDateLabel + '_meWatch-EPG-Schedule'
			);

			expect(analyticsPath.epgSchedulePath(thursday, title)).to.equal('//THU-1106_meWatch-EPG-Schedule');
			expect(analyticsPath.epgSchedulePath(friday, title)).to.equal('//FRI-1206_meWatch-EPG-Schedule');
			expect(analyticsPath.epgSchedulePath(saturday, title)).to.equal('//SAT-1306_meWatch-EPG-Schedule');
			expect(analyticsPath.epgSchedulePath(sunday, title)).to.equal('//SUN-1406_meWatch-EPG-Schedule');
			expect(analyticsPath.epgSchedulePath(monday, title)).to.equal('//MON-1506_meWatch-EPG-Schedule');
			expect(analyticsPath.epgSchedulePath(tuesday, title)).to.equal('//TUE-1606_meWatch-EPG-Schedule');
			expect(analyticsPath.epgSchedulePath(wednesday, title)).to.equal('//WED-1706_meWatch-EPG-Schedule');
		});

		it('EPG Schedule Item', () => {
			const today = new Date();
			today.setHours(0);
			today.setMinutes(0);

			const monthLabel = `${today.getMonth() + 1}`.padStart(2, '0');
			const dayLabel = `${today.getDate()}`.padStart(2, '0');
			const todayDateLabel = `${dayLabel}${monthLabel}`;
			const thursday = new Date(2020, 5, 11, 8, 10);
			const friday = new Date(2020, 5, 12, 9, 0);
			const saturday = new Date(2020, 5, 13, 10, 0);
			const sunday = new Date(2020, 5, 14, 11, 0);
			const monday = new Date(2020, 5, 15, 12, 0);
			const tuesday = new Date(2020, 5, 16, 13, 0);
			const wednesday = new Date(2020, 5, 17, 14, 0);

			const channelTitle = 'meWatch EPG Schedule';
			const itemTitle = 'The Legend Of Miyue - EP 40';

			expect(analyticsPath.epgScheduleItemPath(today, itemTitle, channelTitle)).to.equal(
				'//TODAY-' + todayDateLabel + '_meWatch-EPG-Schedule/0000_The-Legend-Of-Miyue---EP-40'
			);

			expect(analyticsPath.epgScheduleItemPath(thursday, itemTitle, channelTitle)).to.equal(
				'//THU-1106_meWatch-EPG-Schedule/0810_The-Legend-Of-Miyue---EP-40'
			);

			expect(analyticsPath.epgScheduleItemPath(friday, itemTitle, channelTitle)).to.equal(
				'//FRI-1206_meWatch-EPG-Schedule/0900_The-Legend-Of-Miyue---EP-40'
			);
			expect(analyticsPath.epgScheduleItemPath(saturday, itemTitle, channelTitle)).to.equal(
				'//SAT-1306_meWatch-EPG-Schedule/1000_The-Legend-Of-Miyue---EP-40'
			);
			expect(analyticsPath.epgScheduleItemPath(sunday, itemTitle, channelTitle)).to.equal(
				'//SUN-1406_meWatch-EPG-Schedule/1100_The-Legend-Of-Miyue---EP-40'
			);
			expect(analyticsPath.epgScheduleItemPath(monday, itemTitle, channelTitle)).to.equal(
				'//MON-1506_meWatch-EPG-Schedule/1200_The-Legend-Of-Miyue---EP-40'
			);
			expect(analyticsPath.epgScheduleItemPath(tuesday, itemTitle, channelTitle)).to.equal(
				'//TUE-1606_meWatch-EPG-Schedule/1300_The-Legend-Of-Miyue---EP-40'
			);
			expect(analyticsPath.epgScheduleItemPath(wednesday, itemTitle, channelTitle)).to.equal(
				'//WED-1706_meWatch-EPG-Schedule/1400_The-Legend-Of-Miyue---EP-40'
			);
		});
	});
});
