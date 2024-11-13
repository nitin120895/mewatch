import { isEntitledItem } from 'shared/account/accountUtil';

/**
 * Generates the price label
 */
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
 * Whether the user is able to watch the content without triggering a purchasing interface.
 *
 * Free content bypasses the purchase flow. zero dollar offers transparently trigger a free transaction.
 */
function isEntitledOffer(offer: api.Offer): boolean {
	switch (offer.ownership) {
		case 'Free':
			return true;
		case 'Own':
		case 'Rent':
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
	const isPurchasable = offer.ownership === 'Own' || offer.ownership === 'Rent';
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
