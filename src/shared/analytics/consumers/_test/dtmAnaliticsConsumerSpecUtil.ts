import { DTMGeneralMetaData, DTMItemMetaData, DTMVideoTrackingMetaData } from '../dtmAnalyticsConsumer';
import { MediaInfo } from '../analyticsConsumersUtil';
import { AnalyticsEventMap } from 'shared/analytics/types/v3/event/analyticsEventMap';

export const mockGeneralEvent = <AnalyticsEventMap['Page Viewed']>{
	context: {
		page: {
			id: '330',
			path: '/',
			title: 'Home',
			template: {
				name: 'Home'
			}
		},
		user: {
			profiles: [],
			userGroup: 'Anonymous',
			locale: 'en-US',
			clientId: '5d955846-27d2-4eba-9c9b-ceec405e6081'
		}
	},
	timestamp: Date.now(),
	type: 'Page Viewed'
};

export const mockGeneralMcDataLayer = <DTMGeneralMetaData>{
	channel: 'sg:mewatch:online',
	contentid: 'NA',
	contentlength: 'NA',
	contentname: 'NA',
	contentpublishdate: 'NA',
	language: 'en',
	loggedinstatus: false,
	loginsource: 'NA',
	pagename: 'sg:mewatch:online:home',
	ssoid: 'NA',
	usertype: 'Free'
};

export const mockItemDetailEvent = <AnalyticsEventMap['Item Detail Viewed']>{
	context: {
		entry: { key: 'Home', pagePath: '/', position: 0, template: 'Home', title: 'Home', type: 'default' },
		session: {
			app: {
				build: '_NO_CLIENT_BUILD_',
				env: 'localhost',
				name: '_NO_CLIENT_NAME_',
				version: '_NO_CLIENT_VERSION_'
			},
			id: '6d022af3-8c09-432d-9169-bee242e6fb49',
			startTime: 1572625734589,
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'
		},
		page: {
			id: '448',
			path: '/movie/Fish-Tank-36437',
			title: 'Fish Tank',
			template: {
				name: 'Movie Detail',
				isStatic: false
			},
			url: '',
			referrer: ''
		},
		user: {
			profiles: [],
			userGroup: 'Anonymous',
			locale: 'en-US',
			clientId: '5d955846-27d2-4eba-9c9b-ceec405e6081',
			referenceid: 441246
		},
		item: {
			id: '36437',
			title: 'Fish Tank',
			path: '/movie/Fish-Tank-36437',
			releaseYear: 2014,
			showTitle: undefined,
			type: 'movie',
			customId: '316538',
			currentTime: 0,
			duration: 180,
			episodeNumber: undefined,
			categories: [],
			genres: ['drama'],
			watchPath: '[watchPath]',
			customFields: {
				Airplay: 'False',
				AudioLanguages: ['English'],
				BillingId: 12345,
				Embedding: 'True',
				Encryption: 'True',
				EntryId: '0_skmzaxcb',
				HasTrailer: 'True',
				Interactive: 'False',
				MediaFileId: 579255,
				Product: 'SVOD',
				Provider: 'Cinemaworld',
				RatingAdvisories: 'Sexual Scenes 性相关画',
				SubtitleLanguages: ['English'],
				Territory: 'Singapore',
				TypeDescription: 'Movie'
			},
			offers: [
				{
					availability: 'Available',
					deliveryType: 'Stream',
					endDate: new Date('2035-12-31T15:55:00Z'),
					exclusionRules: [],
					id: '457',
					name: 'Toggle Prime - Monthly',
					ownership: 'Subscription',
					price: 0,
					resolution: 'Unknown',
					scopes: ['36437'],
					startDate: new Date('2014-09-30T16:00:00Z'),
					subscriptionCode: '457'
				}
			]
		}
	},
	detail: undefined,
	timestamp: Date.now(),
	type: 'Item Detail Viewed'
};

export const mockItemMcDataLayer = <DTMItemMetaData>{
	...mockGeneralMcDataLayer,
	mediainfo: 'mewatch:316538:180:F:NA:NA:EN:NA:NA:NA:NA:Cinemaworld:NA:DR',
	doctype: 'Video',
	pagename: 'sg:mewatch:online:movie:Fish-Tank-36437',
	contentid: '316538',
	contentlength: 180,
	contentname: 'Fish Tank',
	contentpublishdate: '20140930'
};

export const mockMediaInfo = <MediaInfo>{
	site: 'mewatch',
	mediaId: '316538',
	duration: 180,
	product: 'F',
	mediaType: undefined,
	mediaChannel: 'NA',
	language: 'EN',
	hashTag: undefined,
	episodeNumber: undefined,
	mediaRights: 'NA',
	mediaGroup: 'NA',
	provider: 'Cinemaworld',
	airTime: 'NA',
	currentGenres: 'DR'
};

export const mockMediaInfoVideoLayer = <DTMVideoTrackingMetaData>{
	mediatype: 'Video',
	mediaid: '316538',
	mediatitle: 'Fish Tank',
	mediaseriestitle: 'NA',
	mediacategory: 'NA',
	mediapublishdate: '20140930',
	mediaurl: '/movie/Fish-Tank-36437',
	referenceid: 'NA',
	masrefid: 'NA',
	mediagenre: 'DR',
	mediaclassification: 'Short'
};

export const mockVideoPlayingEvent = <AnalyticsEventMap['Video First Playing']>{
	...mockItemDetailEvent,
	type: 'Video First Playing'
};
