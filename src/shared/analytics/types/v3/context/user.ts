export interface Profile {
	id: string;
	segments: string;
}

export interface PlanDetails {
	planId?: string;
	planTitle?: string;
	planType?: string;
}

export interface StateUserContextData {
	userId: string;
	userGroup: string;
	profiles: Profile[];
	accountSegments: string;
	isTrialPeriod: boolean;
	usedTrialPeriod: boolean;
	subscriptions: api.Subscription[];
	referenceId: number;
	cxRandomId?: string;
}

export type RegisteredUserContext = {
	locale: string;
	clientId: string;
	profiles: Profile[];
} & PlanDetails &
	StateUserContextData;

export const AnonymousUserUserGroup: 'Anonymous' = 'Anonymous';

export interface AnonymousUserContext {
	locale: string;
	userId?: never;
	clientId: string;
	userGroup: typeof AnonymousUserUserGroup;
	profiles: Profile[];
	cxRandomId?: string;
}

export type UserContext = RegisteredUserContext | AnonymousUserContext;
