const uuidv4 = require('uuid/v4');
import { SEARCH_RESULT_TEMPLATES } from 'shared/page/pageEntryTemplate';
import { getItem, setItem } from '../util/localStorage';
import { get, pick, toSelfOrEmptyArray } from '../util/objects';
import { getItem as getSessionStorage, setItem as setSessionStorage } from '../util/sessionStorage';
import { SESSION_TIMEOUT_MS } from './config';
import { EntryProps, Option } from './types/types';
import { EntryContext, EntryContextTypes, Image, ItemContext, ServiceTypeMap } from './types/v3/context/entry';
import { PageContext } from './types/v3/context/page';
import { SessionContext } from './types/v3/context/session';

import {
	AnonymousUserContext,
	AnonymousUserUserGroup,
	PlanDetails,
	Profile,
	RegisteredUserContext,
	UserContext
} from './types/v3/context/user';
import { findToken, decodeJwt } from 'shared/util/tokens';
import { getEnvironment, getLocale, getReferrer, getUserAgent, windowLocation } from './util/browser';
import { isHOOQ } from 'toggle/responsive/util/playerUtil';

const getProfileData = ({ id, segments }: api.ProfileSummary): Profile => ({ id: id, segments: segments.join(',') });
const getProfiles = (accountInfo: api.Account): UserContext['profiles'] =>
	(accountInfo.profiles || []).map(getProfileData);
const getIsTrialPeriod = (accountInfo: api.Account) =>
	(accountInfo.subscriptions || []).some(subscription => subscription.isTrialPeriod);

const getPlanDetails = (accountInfo: api.Account, subscriptionConfigPlans: api.Plan[]): PlanDetails => {
	const accountSubscriptionCode = accountInfo.subscriptionCode;

	const subscription = toSelfOrEmptyArray(subscriptionConfigPlans).find(
		sub => sub.subscriptionCode === accountSubscriptionCode
	);

	if (!subscription) return {};

	const { id, title, type } = subscription;
	return { planId: id, planTitle: title, planType: type };
};

function makeAndStoreClientId() {
	const clientId = uuidv4();
	setItem('analytics.clientId', clientId);
	return clientId;
}

export function getUserContext(parameters: {
	info: api.Account | undefined;
	segments: string[];
	plans: Option<api.Plan[]>;
}): UserContext {
	let { info, segments, plans } = parameters;
	let userContext: UserContext;
	const clientId = getItem('analytics.clientId') || makeAndStoreClientId();
	if (info) {
		const planDetails: PlanDetails = plans ? getPlanDetails(info, plans) : {};
		userContext = {
			clientId,
			userId: info.id,
			userGroup: info.subscriptionCode,
			profiles: getProfiles(info),
			accountSegments: (segments || []).sort().join(),
			isTrialPeriod: getIsTrialPeriod(info),
			usedTrialPeriod: info.usedFreeTrial,
			locale: getLocale(),
			subscriptions: info.subscriptions,
			...planDetails
		} as RegisteredUserContext;
	} else {
		userContext = {
			clientId,
			userGroup: AnonymousUserUserGroup,
			profiles: [],
			locale: getLocale()
		} as AnonymousUserContext;
	}

	return userContext;
}

export function getReferenceId(tokens: api.AccessToken[]): number {
	if (!tokens.length) return;
	const token = findToken(tokens, 'UserAccount', 'Catalog');
	const body = decodeJwt(token);

	return body.houseHoldId;
}

export function getPageContext(page: api.Page | api.PageSummary) {
	const [url, referrer] = [windowLocation(), getReferrer()];
	const { key, template, isStatic, id, title, path } = page;
	const contextTemplate = { isStatic, name: template };
	return {
		id,
		title,
		path,
		template: { ...contextTemplate },
		entries: (<api.Page>page).entries ? (<api.Page>page).entries.length : 0,
		url,
		referrer,
		key
	} as PageContext;
}

function getSession(idleTimeMs) {
	const session = getSessionStorage('analytics.session');
	const isValidSession = session && session.id && session.startTime ? true : false;
	const isExpiredSession = idleTimeMs > SESSION_TIMEOUT_MS;
	if (isValidSession && !isExpiredSession) {
		return session;
	}
}

function makeAndStoreSession() {
	const session = {
		id: uuidv4(),
		startTime: Date.now()
	};
	setSessionStorage('analytics.session', session);
	return session;
}

export function getSessionContext(idleTimeMs): SessionContext {
	const session = getSession(idleTimeMs) || makeAndStoreSession();
	return {
		...session,
		app: {
			name: process.env.CLIENT_NAME || '_NO_CLIENT_NAME_',
			version: process.env.CLIENT_VERSION || '_NO_CLIENT_VERSION_',
			build: process.env.CLIENT_BUILD || '_NO_CLIENT_BUILD_',
			env: getEnvironment()
		},
		userAgent: getUserAgent()
	};
}

const getListData = (list: EntryProps['list'], type: EntryContextTypes) => {
	if (!list) {
		return {};
	}

	const { id, title, size = 0 } = list;

	return type === EntryContextTypes.User ? { userList: { id, size }, list } : { list: { id, size, title } };
};

export function getDomEventDataEntry(entry?: EntryProps): EntryContext | undefined {
	if (typeof entry === 'undefined') {
		return undefined;
	}

	const entryTemplate = get(entry, 'template');

	const extraData = SEARCH_RESULT_TEMPLATES.includes(entryTemplate)
		? get(entry, 'customFields.analytics.entry.search')
		: get(entry, 'customFields.analytics.entry');

	const {
		type: entryType,
		title,
		template = '',
		index: position,
		location: { pathname: pagePath },
		list,
		item,
		text,
		search
	} = Object.assign({}, entry, extraData);

	const destinationUrl = entry.customFields && entry.customFields.moreLinkUrl;

	const type = SEARCH_RESULT_TEMPLATES.includes(template) ? EntryContextTypes.Search : ServiceTypeMap[entryType];

	const listData = getListData(list, type);

	const eventContextData = {
		...{ pagePath, type, title, template, position },
		...listData,
		...(item
			? {
					item: {
						id: item.id,
						title: item.title,
						type: item.type,
						customId: item.customId,
						episodes: item.episodes,
						extras: item.extras,
						similar: item.similar
					}
			  }
			: {}),
		...(text ? { text: text.substring(0, 100) } : {}),
		...(search ? { search } : {}),
		...(destinationUrl ? { destinationUrl } : {})
	} as EntryContext;

	return eventContextData;
}

export const getItemData = <T extends api.ItemDetail>(item: T | undefined) => {
	return (
		item &&
		(pick(
			item,
			'availableSeasonCount',
			'categories',
			'classification',
			'credits',
			'customFields',
			'customId',
			'duration',
			'episodeName',
			'episodeNumber',
			'genres',
			'id',
			'offers',
			'path',
			'releaseYear',
			'season',
			'seasonId',
			'seasonNumber',
			'show',
			'showId',
			'showTitle',
			'subtype',
			'title',
			'type',
			'watchPath'
		) as ItemContext)
	);
};

export const getImageIdFromUrL = url => (url && (/ImageId='(\d+)'/.exec(url) || [])[1]) || '';
export const getImageData = (
	item: api.ItemSummary | undefined,
	...types: Array<keyof api.ItemSummary['images']> // Allow multiple for fallbacks
): Image | undefined => {
	const images = item && item.images;
	if (images) {
		const type = types.find(type => !!images[type]);
		const url = images[type];
		return url && { url, type: type.toString(), id: getImageIdFromUrL(url) };
	}
};

export function getPageAsEntry(page: api.PageSummary & { item?: api.ItemDetail }) {
	return {
		pagePath: page.path,
		type: page.item ? EntryContextTypes.Item : EntryContextTypes.Default,
		title: page.title,
		template: page.template,
		position: 0,
		key: page.key
	};
}

export function checkHooqContent(state?: state.Root): boolean {
	const players = get(state, 'player.players');

	if (!players || !players.length) return;

	const playerId = Object.keys(players)[0];
	const currentItem = players[playerId] && players[playerId].item;

	return isHOOQ(currentItem);
}
