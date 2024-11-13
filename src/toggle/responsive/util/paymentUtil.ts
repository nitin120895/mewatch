import { memoize } from 'shared/util/performance';
import { getItem, setItem } from 'shared/util/localStorage';
import { LAST_PAYMENT_RETURN_DATA_NAME } from '../pageEntry/subscription/subscriptionsUtils';
import { get } from 'shared/util/objects';

export enum PaymentMethods {
	CARD = 'Card',
	TELCO = 'Telco',
	APPLE = 'Apple',
	GOOGLE = 'Google',
	GIFT = 'Gift'
}

export enum CardOptions {
	REMEMBERED = 'remembered',
	NEW = 'new'
}

export enum CardBrand {
	VISA = 'visa',
	MASTER = 'mc'
}

export interface PaymentReturnData {
	paymentType: PaymentMethods;
	path: string;
	packageId?: string;
	packageName?: string;
	changeCard?: boolean;
	removeCard?: boolean;
	payAnalyticsDone?: boolean;
	promoCode?: string;
	totalPrice?: number;
	paymentMethodId?: string;
	entitlementValidated?: boolean;
}

export const PAYMENT_ERROR_CODE_CARD_IN_USE = '3041';

export function getTelecomPaymentMethods(paymentMethods: string[]): string[] {
	return paymentMethods.filter(
		method => method !== PaymentMethods.CARD && method !== PaymentMethods.APPLE && method !== PaymentMethods.GOOGLE
	);
}

export function getBillingCardInformation(accountBillingMethods: api.PaymentMethod[]): api.PaymentMethod[] {
	return accountBillingMethods.filter(method => method.type === PaymentMethods.CARD);
}

export function findAvailablePaymentMethod(allowedPaymentMethods: string[], type: string): boolean {
	return allowedPaymentMethods && allowedPaymentMethods.some(method => method === type);
}

export function checkPaymentMethodForCancel(paymentMethod: string): boolean {
	return paymentMethod !== PaymentMethods.APPLE && paymentMethod !== PaymentMethods.GOOGLE;
}

export const PaymentMethodsTitleMap = {
	[PaymentMethods.TELCO]: '@{subscription_payment_method_m1|M1 Purchase}',
	[PaymentMethods.CARD]: '@{subscription_payment_method_card|Card Purchase}',
	[PaymentMethods.APPLE]: '@{subscription_payment_method_in-app|In-App Purchase}',
	[PaymentMethods.GOOGLE]: '@{subscription_payment_method_in-app|In-App Purchase}',
	[PaymentMethods.GIFT]: '@{subscription_payment_method_gift|Gift}'
};

export const PaymentSuccessStatusMap = {
	[PaymentMethods.CARD]: 'OK',
	[PaymentMethods.TELCO]: '0',
	[PaymentMethods.APPLE]: 'OK',
	[PaymentMethods.GOOGLE]: 'OK'
};

export function inAppPurchaseSubscription(paymentMethod: string): boolean {
	return paymentMethod === PaymentMethods.GOOGLE || paymentMethod === PaymentMethods.APPLE;
}

export const filterCards = memoize((paymentMethods: api.PaymentMethod[]) => {
	return paymentMethods.filter(method => method.type === PaymentMethods.CARD);
});

export function getAccountTelcoPayments(subscriptions: api.SubscriptionDetail[]): boolean {
	return subscriptions.some(subscription => isTelcoPayment(subscription.paymentMethod as PaymentMethods));
}

export function getAccountInAppPayments(subscriptions: api.SubscriptionDetail[]): boolean {
	return subscriptions.some(subscription => inAppPurchaseSubscription(subscription.paymentMethod));
}

export function isOnlyAccountTelcoOrInAppPayments(subscriptions: api.SubscriptionDetail[]): boolean {
	return subscriptions.length && subscriptions.every(subscription => inAppOrTelcoPayment(subscription.paymentMethod));
}

function inAppOrTelcoPayment(paymentMethod: string) {
	return isTelcoPayment(paymentMethod as PaymentMethods) || inAppPurchaseSubscription(paymentMethod);
}

export function isCardPayment(paymentMethod: string): boolean {
	return paymentMethod === PaymentMethods.CARD;
}

export function isTelcoPayment(paymentMethod: PaymentMethods): boolean {
	return paymentMethod === PaymentMethods.TELCO;
}

export function isMasterCard(brand: string): boolean {
	return brand === CardBrand.MASTER;
}

export function isVisaCard(brand: string): boolean {
	return brand === CardBrand.VISA;
}

export function isCardDetailsSaved(paymentMethods: api.PaymentMethod[]): boolean {
	return paymentMethods.some(paymentMethod => isCardPayment(paymentMethod.type));
}

export function getPaymentReturnData(): PaymentReturnData {
	return getItem(LAST_PAYMENT_RETURN_DATA_NAME) || {};
}

export function setChangeChangeCardReturnData(path: string, subscription: any = {}) {
	const { packageId, packageName } = subscription;
	const data: PaymentReturnData = {
		paymentType: PaymentMethods.CARD,
		path,
		packageId,
		packageName,
		changeCard: true,
		totalPrice: 0
	};
	setItem(LAST_PAYMENT_RETURN_DATA_NAME, data);
}

export function getLastUsedExternalID(paymentMethods: api.PaymentMethod[]) {
	const cards = getBillingCardInformation(paymentMethods);
	const lastUsedCard = cards.length && cards[0];
	return get(lastUsedCard, 'externalId');
}

export function isInMantinenceMode(): Promise<boolean> {
	return fetch('/ex-setting')
		.then(res => res.json())
		.then(json => Promise.resolve(json.paymentMaintenance));
}

export function getPaymentPageUrl({ plan, price, pricePlanPath, sessionId, sessionData }) {
	const planName = encodeURIComponent(plan);
	const planPrice = encodeURIComponent(price);
	const redirectUrl = encodeURIComponent(`${window.location.protocol}//${window.location.host}${pricePlanPath}`);
	return `${
		process.env.CLIENT_PAYMENT_PAGE_URL
	}?sessionId=${sessionId}&sessionData=${sessionData}&plan=${planName}&price=${planPrice}&redirectUrl=${redirectUrl}`;
}

export function getChangeCardPageUrl({ sessionId, pricePlanPath, sessionData }) {
	const redirectUrl = encodeURIComponent(`${window.location.protocol}//${window.location.host}${pricePlanPath}`);
	return `${
		process.env.CLIENT_CHANGE_CARD_PAGE_URL
	}?sessionId=${sessionId}&sessionData=${sessionData}&redirectUrl=${redirectUrl}`;
}
