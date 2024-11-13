import { DTMLoginProviders } from 'shared/analytics/consumers/dtmAnalyticsConsumer';
import { StartoverInfo } from './video';

export interface DTMAnalyticsData {
	language: string;
	loginsource: DTMLoginProviders | 'NA'; // To replace in FE
	loginstatus: 'True' | 'False'; // To replace in FE; True / False
	pagename: string;
	channel: string;
	ssoid: string; // To replace in FE
	usertype: string; // To replace in FE
}

export interface GetAnalyticContextData {
	activeProfile: api.ProfileDetail;
	plans: api.Plan[];
	account: api.Account;
	item: api.ItemDetail;
	startoverInfo?: StartoverInfo;
}
