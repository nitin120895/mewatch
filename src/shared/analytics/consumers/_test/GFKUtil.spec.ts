import {
	getGfkCategories,
	GfkCategoryMap,
	GfkCategoryDefault,
	getGfkVideoType,
	TvmMediaType,
	getGfkAudioLanguages,
	getGfkEpisodeId,
	getEpisodeWebStatus,
	isItemPaid,
	BillingId,
	getShowTitle,
	getProviderExternalID,
	getHashtag,
	getMasterRefId
} from 'shared/analytics/gfk/util';
import { ItemContext } from 'shared/analytics/types/v3/context/entry';
import { IVideoCanPlayActionDetail } from 'shared/analytics/types/v3/event/videoEvents';
import { NA } from 'shared/analytics/consumers/analyticsConsumersUtil';
import { expect } from 'chai';

describe('GFK Analytics', () => {
	describe('(Function) getGfkCategories', () => {
		it('should return matched categories as per "GfkCategoryMap"', () => {
			const itemContext = {
				categories: ['catchup tv/ch5', 'watch it first/cna', '987tv', 'wrong category']
			} as ItemContext;
			const matchedCategories = getGfkCategories(itemContext);
			const expectedCategories = [
				GfkCategoryMap['catchup tv/ch5'],
				GfkCategoryMap['watch it first/cna'],
				GfkCategoryMap['987tv']
			].join(',');

			expect(matchedCategories).to.equal(expectedCategories);
		});

		it('should return GfkCategoryDefault if no categories matched', () => {
			const itemContext = {
				categories: []
			} as ItemContext;
			const matchedCategories = getGfkCategories(itemContext);

			expect(matchedCategories).to.equal(GfkCategoryDefault);
		});
	});

	describe('(Function) getGfkVideoType', () => {
		it('should return TvmMediaType.Ad for advertisement', () => {
			const itemContext = {} as ItemContext;
			const detail = {
				isAdPlaying: true
			} as IVideoCanPlayActionDetail;
			const videoType = getGfkVideoType(itemContext, detail);

			expect(videoType).to.equal(TvmMediaType.Ad);
		});

		it('should return TvmMediaType.Content for other assets', () => {
			const itemContext = {
				type: 'episode'
			} as ItemContext;
			const detail = {
				isAdPlaying: false
			} as IVideoCanPlayActionDetail;
			const videoType = getGfkVideoType(itemContext, detail);

			expect(videoType).to.equal(TvmMediaType.Content);
		});
	});

	describe('(Function) getGfkAudioLanguages', () => {
		it('should return NA for Linear', () => {
			const itemContext = {
				type: 'channel'
			} as ItemContext;
			const detail = {
				audioLanguages: ['en', 'zh', 'ta']
			} as IVideoCanPlayActionDetail;
			const audioLanguages = getGfkAudioLanguages(itemContext, detail);

			expect(audioLanguages).to.equal(NA);
		});

		it('should return string with available languages', () => {
			const itemContext = {} as ItemContext;
			const detail = {
				audioLanguages: ['en', 'zh', 'ta']
			} as IVideoCanPlayActionDetail;
			const audioLanguages = getGfkAudioLanguages(itemContext, detail);

			expect(audioLanguages).to.equal('en;zh;ta');
		});

		it('should return empty string if no languages available', () => {
			const itemContext = {
				type: 'episode'
			} as ItemContext;
			const detail = {
				audioLanguages: []
			} as IVideoCanPlayActionDetail;
			const audioLanguages = getGfkAudioLanguages(itemContext, detail);

			expect(audioLanguages).to.equal('');
		});
	});

	describe('(Function) getGfkEpisodeId', () => {
		const title = 'episodeTitle';
		const number = 42;

		it('should return string with episode number and title for episodes', () => {
			const itemContext = {
				type: 'episode',
				episodeName: title,
				episodeNumber: number
			} as ItemContext;
			const episodeId = getGfkEpisodeId(itemContext);

			expect(episodeId).to.equal(`${number} ${title}`);
		});

		it('should return NA for not episode assets', () => {
			const itemContext = {
				type: 'show'
			} as ItemContext;
			const episodeId = getGfkEpisodeId(itemContext);

			expect(episodeId).to.equal(NA);
		});
	});

	describe('(Function) getGfkEpisodeId', () => {
		const title = 'episodeTitle';
		const number = 42;

		it('should return string with episode number and title for episodes', () => {
			const itemContext = {
				type: 'episode',
				episodeName: title,
				episodeNumber: number
			} as ItemContext;
			const episodeId = getGfkEpisodeId(itemContext);

			expect(episodeId).to.equal(`${number} ${title}`);
		});

		it('should return NA for not episode assets', () => {
			const itemContext = {
				type: 'show'
			} as ItemContext;
			const episodeId = getGfkEpisodeId(itemContext);

			expect(episodeId).to.equal(NA);
		});
	});

	describe('(Function) getEpisodeWebStatus', () => {
		it('should return 1 for Movies', () => {
			const itemContext = {
				type: 'movie'
			} as ItemContext;
			const webStatus = getEpisodeWebStatus(itemContext);

			expect(webStatus).to.equal(1);
		});

		it('should return 1 for Clips', () => {
			const itemContext = {
				type: 'program',
				subtype: 'ProgramClip'
			} as ItemContext;
			const webStatus = getEpisodeWebStatus(itemContext);

			expect(webStatus).to.equal(1);
		});

		it('should return 1 for Extras', () => {
			const itemContext = {
				type: 'program',
				subtype: 'ProgramExtra'
			} as ItemContext;
			const webStatus = getEpisodeWebStatus(itemContext);

			expect(webStatus).to.equal(1);
		});

		it('should return 0 for other assets', () => {
			const itemContext = {
				type: 'episode',
				subtype: 'NewsSeries'
			} as ItemContext;
			const webStatus = getEpisodeWebStatus(itemContext);

			expect(webStatus).to.equal(0);
		});
	});

	describe('(Function) isItemPaid', () => {
		it('should return 1 for Paid items', () => {
			const itemContext = {
				customFields: {
					BillingId: BillingId.Paid
				}
			} as any;
			const paidStatus = isItemPaid(itemContext);

			expect(paidStatus).to.equal(1);
		});

		it('should return 0 for Free items', () => {
			const itemContext = {
				customFields: {
					BillingId: BillingId.Free
				}
			} as any;
			const paidStatus = isItemPaid(itemContext);

			expect(paidStatus).to.equal(0);
		});
	});

	describe('(Function) getShowTitle', () => {
		it('should return show title', () => {
			const itemContext = {
				type: 'show',
				season: { show: { title: 'showTitle' } }
			} as ItemContext;
			const showTitle = getShowTitle(itemContext);

			expect(showTitle).to.equal('showTitle');
		});

		it('should return NA for Linear items', () => {
			const itemContext = {
				type: 'channel'
			} as ItemContext;
			const showTitle = getShowTitle(itemContext);

			expect(showTitle).to.equal(NA);
		});

		it('should return NA for not show items', () => {
			const itemContext = {
				type: 'episode'
			} as ItemContext;
			const showTitle = getShowTitle(itemContext);

			expect(showTitle).to.equal(NA);
		});
	});

	describe('(Function) getProviderExternalID', () => {
		it('should return Provider External ID', () => {
			const itemContext = {
				customFields: {
					ProviderExternalID: 'ProviderExternalID'
				}
			} as any;
			const ProviderExternalID = getProviderExternalID(itemContext);

			expect(ProviderExternalID).to.equal('ProviderExternalID');
		});

		it('should return empty string', () => {
			const itemContext = {
				customFields: {}
			} as ItemContext;
			const ProviderExternalID = getProviderExternalID(itemContext);

			expect(ProviderExternalID).to.equal('');
		});
	});

	describe('(Function) getHashtag', () => {
		it('should return Hashtag', () => {
			const itemContext = {
				customFields: {
					Hashtag: 'Hashtag'
				}
			} as any;
			const Hashtag = getHashtag(itemContext);

			expect(Hashtag).to.equal('Hashtag');
		});

		it('should return NA for Clips', () => {
			const itemContext = {
				type: 'program',
				subtype: 'ProgramClip'
			} as ItemContext;
			const Hashtag = getHashtag(itemContext);

			expect(Hashtag).to.equal(NA);
		});

		it('should return NA for Linear items', () => {
			const itemContext = {
				type: 'channel'
			} as ItemContext;
			const Hashtag = getHashtag(itemContext);

			expect(Hashtag).to.equal(NA);
		});

		it('should return NA for Extras', () => {
			const itemContext = {
				type: 'program',
				subtype: 'ProgramExtra'
			} as ItemContext;
			const Hashtag = getHashtag(itemContext);

			expect(Hashtag).to.equal(NA);
		});
	});

	describe('(Function) getMasterRefId', () => {
		it('should return MasterRefId', () => {
			const itemContext = {
				customFields: {
					MasterRefId: 'MasterRefId'
				}
			} as any;
			const MasterRefId = getMasterRefId(itemContext);

			expect(MasterRefId).to.equal('MasterRefId');
		});

		it('should return NA', () => {
			const itemContext = {
				customFields: {}
			} as ItemContext;
			const MasterRefId = getMasterRefId(itemContext);

			expect(MasterRefId).to.equal(NA);
		});
	});
});
