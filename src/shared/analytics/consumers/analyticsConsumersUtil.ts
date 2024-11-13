import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { isMobile } from 'shared/util/browser';
import { UserContext, RegisteredUserContext } from '../types/v3/context/user';
import { ItemDetailTemplates } from 'shared/page/pageTemplate';
import { ItemContext } from '../types/v3/context/entry';
import { getActiveSubscriptions } from 'toggle/responsive/pageEntry/account/accountUtils';
import { getLoginSource } from 'toggle/responsive/util/authUtil';
import { getCurrentTime } from 'toggle/responsive/util/playerUtil';
import { get } from 'shared/util/objects';
import { EntryContextProperty, ItemContextProperty } from '../types/v3/context';
import { isEpisode } from 'shared/util/itemUtils';
import { DTMGlobal } from './dtmAnalyticsConsumer';

export interface MediaInfo {
	site: string;
	mediaId: string;
	duration: number;
	product: string;
	mediaType: string | undefined;
	language: string;
	episodeNumber: number | undefined;
	mediaRights: string;
	mediaGroup: string;
	provider: string;
	currentGenres: string;
	mediaChannel: string;
	hashTag: string;
	airTime: string;
}

const isMobileDevice = isMobile();
export const NA = 'NA';

export const MEDIA_RIGHTS = {
	'rights/localmediacorp': 'LM',
	'rights/localacquired': 'LA',
	'rights/foreignacquired': 'FA'
};

export const MEDIA_GROUP = {
	'catchup tv': 'CU',
	'watch it first': 'T',
	'on demand/mediacorp': 'M',
	togglecelebritybuzz: 'LEB',
	koreanbuzz: 'FEB',
	asianbuzz: 'FEB',
	hollywoodbuzz: 'FEB',
	'toggle originals': 'TO'
};

const MEDIA_GENRES = {
	'action and adventure': 'AA',
	animal: 'AL',
	animation: 'AN',
	anime: 'AM',
	biology: 'BI',
	cats: 'CT',
	chemistry: 'CH',
	'children and family': 'CF',
	chinese: 'ZH',
	comedy: 'CO',
	'current affairs': 'CA',
	documentary: 'DO',
	dogs: 'DG',
	drama: 'DR',
	economics: 'EC',
	education: 'ED',
	entertainment: 'EN',
	events: 'EV',
	'fashion and beauty': 'FB',
	food: 'FO',
	'game show': 'GS',
	geography: 'GE',
	'guinea pig': 'GP',
	hamsters: 'HA',
	health: 'HE',
	historical: 'HC',
	'home improvement': 'HI',
	horror: 'HR',
	'horror and thriller': 'HT',
	indian: 'IN',
	indie: 'ID',
	instructional: 'IS',
	lifestyle: 'LS',
	malay: 'MA',
	music: 'MU',
	musical: 'ML',
	news: 'NW',
	'older kids (7-12)': 'OK',
	physics: 'PH',
	'preschool (2-6)': 'PS',
	preview: 'PR',
	pabbits: 'RA',
	peality: 'RT',
	'pestricted 21': 'RS',
	romance: 'RO',
	sciences: 'SC',
	'sci-fi and fantasy': 'SF',
	shopping: 'SH',
	sitcom: 'ST',
	sports: 'SP',
	'talk show': 'TS',
	thriller: 'TH',
	travel: 'TR',
	'user generated': 'US',
	variety: 'VR'
};

export class PageDataTag {
	private static country = 'sg';
	private static siteName = 'mewatch';
	private static deviceType = isMobileDevice ? 'mobileweb' : 'online';

	public static getAssetName = (item: ItemContext): string => {
		const mediaTitle = get(DTMGlobal, 'MediaInfo.omniture.mediatitle');
		if (mediaTitle && mediaTitle !== NA) return mediaTitle;
	};

	public static getItemDuration = (type: string, duration: number): number | undefined =>
		type === 'channel' ? undefined : duration;

	public static getPlayerName = (): string => 'mewatch_online_kalturaplayer';

	public static getCurrentTime = (): number => getCurrentTime();

	public static isItemContext = (context: ItemContextProperty) => !!context.item;
	public static isEntryContext = (context: EntryContextProperty) => !!context.entry;

	public static getStartDate = (item: api.ItemDetail): string => {
		let startDate = get(item, 'offers.0.startDate');
		if (!startDate) return NA;
		if (startDate instanceof Date) {
			// it needs preferable for unit tests because api.Offer['startData'] has Date type, but in fact it's a string
			startDate = startDate.toISOString(); // convert to ISO 8601 string e.g. 2000-12-31T00:00:00Z
		}
		const date = startDate.split('T')[0];
		return date.split('-').join('');
	};

	public static getLanguage = (locale: string): string => locale.split('-')[0];

	public static getChannel(): string {
		return [this.country, this.siteName, this.deviceType].join(':');
	}

	public static isRegisteredUser = (user: UserContext): user is RegisteredUserContext =>
		!!(<RegisteredUserContext>user).userId;

	public static getSSOId(user: UserContext): string {
		return user.userId || NA;
	}

	public static getLoginSource(user: UserContext): string {
		const loginsource = getLoginSource();
		return this.isRegisteredUser(user) ? loginsource : NA;
	}

	public static getUserType(user: UserContext): string {
		if (!this.isRegisteredUser(user)) return 'Free';

		const activeSubscriptions = this.getActiveSubscriptions(user.subscriptions);
		if (!activeSubscriptions.length) return 'Free';

		const planIds = activeSubscriptions.map((subscription: api.Subscription) => subscription.planId);
		return `Paid|${planIds.join(',')}`;
	}

	public static getCategories(categories: string[], values: object, pipe?: boolean): string {
		const results = categories.reduce((arr, cat) => {
			for (let key in values) {
				if (cat.includes(key) && !arr.includes(values[key])) {
					arr.push(values[key]);
				}
			}
			return arr;
		}, []);

		if (!results.length) return NA;

		return pipe ? results.join('|') : results.join(',');
	}

	public static getActiveSubscriptions(userSubscriptions: api.Subscription[]) {
		const subscriptions = getActiveSubscriptions(userSubscriptions);
		return subscriptions.filter(subscription => subscription.planId !== 'Registered');
	}

	public static getMediaInfoObject(item: ItemContext, user: UserContext): MediaInfo {
		const { customId, duration, offers, customFields, episodeNumber, categories, genres } = item;
		const product = offers && offers.length ? 'F' : 'P',
			language = this.getLanguage(user.locale).toUpperCase(),
			mediaRights = this.getCategories(categories, MEDIA_RIGHTS),
			mediaGroup = this.getCategories(categories, MEDIA_GROUP, true),
			currentGenres = this.getMediaGenres(genres);
		return {
			site: this.siteName,
			mediaId: customId,
			duration,
			product,
			mediaType: customFields.TypeId,
			mediaChannel: NA,
			language,
			hashTag: customFields.Hashtag,
			episodeNumber,
			mediaRights,
			mediaGroup,
			provider: customFields.Provider,
			airTime: NA,
			currentGenres
		};
	}

	public static getMediaGenres(genres: string[]) {
		if (!genres || !genres.length) return NA;

		const genresList = genres.map(genre => {
			return MEDIA_GENRES[genre] || genre;
		});

		return genresList.join(',');
	}

	public static isItemDetailPage(templateName: string): boolean {
		return ItemDetailTemplates.indexOf(templateName) > -1;
	}

	public static getMediaSeriesTitle(item: ItemContext): string {
		if (!isEpisode(item)) return NA;

		return get(item, 'show.title') || get(item, 'season.show.title') || item.showTitle || NA;
	}
}

export function isStartoverMode(event: TrackingEvent) {
	const startoverMode = get(event, 'detail.startoverInfo.startover');
	return startoverMode === true;
}
