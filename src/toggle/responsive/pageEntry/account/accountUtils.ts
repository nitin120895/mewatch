import { getPriceInfo } from '../subscription/subscriptionsUtils';

export enum SubscriptionState {
	Active = 'Active',
	Expired = 'Expired'
}

export function getActiveSubscriptions(subscriptions: api.Subscription[]) {
	if (!subscriptions) return [];

	return subscriptions.filter(subscription => subscription.status === SubscriptionState.Active);
}

export function getExpiredSubscriptions(subscriptions: api.Subscription[]) {
	const filtered = subscriptions
		? subscriptions.filter(subscription => subscription.status === SubscriptionState.Expired)
		: [];
	return filtered.sort(
		(subscription1, subscription2) =>
			new Date(subscription2.endDate).getTime() - new Date(subscription1.endDate).getTime()
	);
}

export function extendSubscriptionsListWithPriceInfo(subscriptionsList, plans) {
	subscriptionsList &&
		subscriptionsList.forEach(item => {
			plans.forEach(plan => {
				if (plan.id === item.planId) {
					item.price = getPriceInfo(plan.label).pricePerMonth;
				}
			});
		});
	return subscriptionsList;
}

export const MIN_SECURE_STRING_LENGTH = 6;

export function hasCommonElement(arr1: string[], arr2: string[]): boolean {
	return arr1.some(item => arr2.includes(item));
}

export enum newslettersClassification {
	meWatch = 'Toggle,Mediacorp_Marketing',
	promotions = 'Mediacorp_Partners'
}

export function getNewslettersbyClassification(
	newsletters: api.Newsletter[],
	classification: AccountPreferencesClassification
): api.Newsletter[] {
	return newsletters.filter(item => item.classification === classification);
}

export function getSubscribedNewsletters(newsletters: api.Newsletter[]): api.Newsletter[] {
	return newsletters.filter(item => item.subscribed);
}

export function getUnsubscribedNewsletters(newsletters: api.Newsletter[]): api.Newsletter[] {
	return newsletters.filter(item => !item.subscribed);
}

export enum AccountPreferencesClassification {
	LIFESTYLE = 'Lifestyle & Entertainment',
	NEWS = 'News'
}

export enum SignupSteps {
	Registration = 1,
	WelcomeMessage = 2
}

export function getAccountFullName(account: api.Account): string {
	const { firstName = '', lastName = '' } = account;
	return [firstName, lastName].join(' ');
}

export function checkPrimeSubscriber(account: api.Account): boolean {
	return account.subscriptions.some(
		subscription => subscription.status === SubscriptionState.Active && subscription.code !== 'Registered'
	);
}
