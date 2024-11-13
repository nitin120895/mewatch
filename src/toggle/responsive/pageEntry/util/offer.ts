import { CTATypes } from 'shared/analytics/types/types';
import { isEntitledItem } from 'shared/account/accountUtil';
import { get } from 'shared/util/objects';

const REGISTERED_SUBSCIPTION_CODE = 'Registered';

export enum Ownership {
	Subscription = 'Subscription',
	Free = 'Free',
	Rent = 'Rent',
	Own = 'Own',
	None = 'None'
}
/**
 * Generates the price label
 */

export interface OfferAction {
	label: string;
	onClick: (e) => void;
	type: CTATypes.Offer;
	data: { offer: api.Offer; item: api.ItemDetail; title: string };
}

export interface OfferActionMap {
	label: string;
	onClick: (e: any) => void;
}

export function resolvePrice(offers: api.Offer[]): string {
	// NOTE: This is a placeholder. A price formatter with appropriate currency symbol
	// will be created in the future.
	return offers[0].price ? `$${offers[0].price}` : undefined;
}

/**
 * Whether the user is entitled or eligable to play the content
 */
export function canPlay(item: api.ItemSummary): boolean {
	if (!item) return false;
	if (isEntitledItem(item)) return true;
	const { offers } = item;
	if (!offers || !offers.length) return false;
	return offers.some(offer => isEntitledOffer(offer));
}

/**
 * Whether is a trailer, all users can play this content.
 */
export function isFree(item: api.ItemSummary): boolean {
	if (!item) return false;
	const { offers } = item;
	if (!offers || !offers.length) return false;
	return offers.some(offer => isEntitledOffer(offer));
}

/**
 * Whether item requires registration to be watched
 */
export function isRegistrationOnlyRequired(item: api.ItemSummary): boolean {
	const offers: api.Offer[] = get(item, 'offers');

	if (!offers && !offers.length) return false;

	return offers.some(({ ownership, subscriptionCode }) => {
		return ownership === Ownership.Subscription && subscriptionCode && subscriptionCode === REGISTERED_SUBSCIPTION_CODE;
	});
}

/**
 * Whether item requires subscription to be watched for the current user
 */
export function isSubscriptionRequired(item: api.ItemSummary): boolean {
	return !canPlay(item) && !isRegistrationOnlyRequired(item);
}

/**
 * Whether the user is able to watch the content without triggering a purchasing interface.
 *
 * Free content bypasses the purchase flow. zero dollar offers transparently trigger a free transaction.
 */
function isEntitledOffer(offer: api.Offer): boolean {
	switch (offer.ownership) {
		case Ownership.Free:
			return true;
		case Ownership.Own:
		case Ownership.Rent:
			if (isFreeEntitlementOffer(offer)) return true;
			break;
	}
	return false;
}

/**
 * Determine whether an offer will result in a free entitlement via a zero dollar transation.
 *
 * As a distinction a Free ownership grants an instant entitlement where as a $0 offer
 * requires a transaction to occur before granting ownershop to the user's profile.
 */
export function isFreeEntitlementOffer(offer: api.Offer): boolean {
	if (!offer) return false;
	const isFree = offer.price === 0;
	const isPurchasable = offer.ownership === Ownership.Own || offer.ownership === Ownership.Rent;
	return isFree && isPurchasable;
}

/**
 * Determine if an Offer is within its period of activity.
 *
 * Rocket will cull expired offers from the API response, however they may expire after
 * the app has downloaded them.
 */
export function isOfferActive(offer: api.Offer): boolean {
	if (!offer) return false;
	const now = Date.now();
	const { startDate, endDate } = offer;
	return !((startDate && startDate.getTime() > now) || (endDate && endDate.getTime() < now));
}
