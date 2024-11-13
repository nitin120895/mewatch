import { DTMLoginProviders } from 'shared/analytics/consumers/dtmAnalyticsConsumer';
import { DTMAnalyticsData } from 'shared/analytics/api/shared';
import { getPathname } from 'shared/page/pagePersistence';
import { UserContext } from 'shared/analytics/types/v3/context/user';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import * as util from 'shared/analytics/api/util';
import { addQueryParameterToURL } from 'shared/util/urls';
import { populateLotameUserData } from 'shared/analytics/api/video';

export interface ComscorePageAnalyticsData {
	c1: string;
	c2: string;
	c3: string;
	ns_st_pu: string;
}

export interface LotamePageAnalyticsData {
	ClientID: string;
	AudienceClientID: string;
	seg: string[];
}

export interface DTMPageAnalyticsData extends DTMAnalyticsData {
	's.visitorNamespace': string;
	contenttype: string;
	dayofweek: string;
	division: string;
	hier1: string;
	hourofday: string;
	pageurl: string;
	site: string;
	sitesection: string;
	subsection2: string;
	subsection: string;
	weektype: string;
	lotame: LotamePageAnalyticsData;
}

export interface PageAnalyticsData {
	omniture: DTMPageAnalyticsData;
	comscore: ComscorePageAnalyticsData;
	lotame: LotamePageAnalyticsData;
	message?: string;
	errorMessage?: string;
}

export interface AdobePageAnalyticsData {
	channel: string | 'NA';
	pagename: string | 'NA';
	language: string | 'NA';
	contentid: string | 'NA';
	contentname: string | 'NA';
	contentpublishdate: string | 'NA';
	contentlength: string | 'NA';
	loggedinstatus: 'True' | 'False';
	ssoid: string | 'NA';
	loginsource: DTMLoginProviders | 'NA';
	usertype: string | 'NA';
}

export interface PageAnalyticsErrorData {
	omniture: {
		channel: 'NA';
		pagename: 'NA';
		language: 'NA';
		ssoid: string;
		loginstatus: 'True' | 'False';
		loginsource: DTMLoginProviders | 'NA';
		usertype: string;
	};
	comscore: 'NA';
	lotame: 'NA';
	gfk: 'NA';
}

function getPageEndpoint() {
	return process.env.CLIENT_ANALYTICS_PAGE_ENDPOINT;
}

export async function getAnalyticsData(
	user: UserContext,
	pagePath: string,
	pageTemplate: string
): Promise<PageAnalyticsData | PageAnalyticsErrorData> {
	const url = getPageEndpoint();

	if (!url) return;

	let path = pagePath;

	if (!pagePath) {
		path = getPathname();
	}

	if (!path) return;

	const queryParams = {
		property: util.getPageProperty(),
		platform: util.getPlatform(pageTemplate),
		sitelang: util.getUserLanguage(user),
		path
	};

	let pageAnalyticsData: PageAnalyticsData;
	try {
		const response = await fetch(addQueryParameterToURL(getPageEndpoint(), queryParams));
		pageAnalyticsData = await response.json();
		if (response.status !== 200 || pageAnalyticsData.message || pageAnalyticsData.errorMessage) {
			return generateErrorData(user);
		}
	} catch (e) {
		return generateErrorData(user);
	}

	if (_DEV_) {
		console.group('pageAnalytics');
		console.log(path);
		console.log(user);
		console.log(pageAnalyticsData);
		console.groupEnd();
	}

	return populateUserInfo(pageAnalyticsData, user);
}

function populateUserInfo(pageAnalyticsData: PageAnalyticsData, user: UserContext) {
	const data = Object.assign({}, pageAnalyticsData);
	data.omniture = populateOmnitureUserData(data.omniture, user);
	data.lotame = populateLotameUserData(data.lotame, user);
	return data;
}

function populateOmnitureUserData(dtmPageAnalyticsData: DTMPageAnalyticsData, user: UserContext): DTMPageAnalyticsData {
	const omniture = Object.assign({}, dtmPageAnalyticsData);

	const isRegisteredUser = util.isRegisteredUser(user);
	const usertype = util.getUserType(user);
	omniture.loginstatus = isRegisteredUser ? 'True' : 'False';
	omniture.ssoid = util.getSSOId(user);
	omniture.usertype = !isRegisteredUser ? 'NA' : usertype;
	omniture.loginsource = util.getLoginSource(user) as DTMLoginProviders;
	return omniture;
}

export function getPagePath(event: any, analyticsEventType: AnalyticsEventType) {
	switch (analyticsEventType) {
		case AnalyticsEventType.USER_PROFILE_PERSONALISATION_PREFERENCES_GENRES:
			return event.context.page.path + '-step-1';
	}
}

function generateErrorData(user: UserContext): PageAnalyticsErrorData {
	const loginStatus = util.isRegisteredUser(user) ? 'True' : 'False';

	return {
		omniture: {
			channel: 'NA',
			pagename: 'NA',
			language: 'NA',
			loginstatus: loginStatus,
			ssoid: util.getSSOId(user),
			usertype: util.getUserType(user),
			loginsource: util.getLoginSource(user) as DTMLoginProviders
		},
		comscore: 'NA',
		lotame: 'NA',
		gfk: 'NA'
	};
}
