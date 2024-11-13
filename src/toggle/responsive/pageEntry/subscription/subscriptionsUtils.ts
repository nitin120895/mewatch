import { browserHistory } from 'shared/util/browserHistory';
import { noop } from 'shared/util/function';
import { PricePlan as PricePlanPageKey, PricePlan as pricePlanPageKey } from 'shared/page/pageKey';
import { getPathByKey, getSignInPath, getRegisterPath, findPageSummaryByPath } from 'shared/page/sitemapLookup';
import { get } from 'shared/util/objects';
import { ChoosePlanModalOwnProps } from './ChoosePlanModal';
import { ChannelInfoModalOwnProps } from './ChannelInfoModal';
import ItemSummary = api.ItemSummary;
import { canPlay, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import { isSeason, isEpisode } from 'ref/responsive/util/item';
import { addQueryParameterToURL } from 'shared/util/urls';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import * as stateUtil from 'shared/analytics/util/stateUtil';

const PRICE_REGEX = /(\$\d+(.?\d)*\s*\/\s*\w+)\s*(\(\d+-\w+\))*\s*\\*(.*)*/i;
export const DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
export const EXPIRED_SUBSCRIPTIONS_VISIBLE_NUMBER = 2;
export const LAST_PAYMENT_RETURN_DATA_NAME = 'lastPaymentReturnData';
export const SELECTED_PRICE_PLAN = 'selectedPricePlan';
const DEFAULT_GST_RATE = 9;

export function getPriceInfo(plan) {
	const priceInfo = plan && PRICE_REGEX.exec(plan);
	return {
		pricePerMonth: priceInfo && priceInfo[1],
		contract: priceInfo && priceInfo[3],
		prepayment: priceInfo && priceInfo[4]
	};
}

// Using the method in the subscriptionPlan.tsx file only because the subscription API entry has no distinct value to identify if the plan is cessation or not. The plan ID can't be used as it varies in every environment.
export function isCessationPlan(planTitle: string, cpName: string): boolean {
	return planTitle && planTitle.toUpperCase() === cpName.toUpperCase();
}

export function openPricePlansModal(
	proceedFunc: () => void,
	plan: api.SubscriptionPlan,
	title: string,
	isPrimaryProfile: boolean,
	account: api.Account,
	selectedPricePlan?: api.SubscriptionPlan
) {
	const props: ChoosePlanModalOwnProps = {
		id: 'choose-plan-modal',
		title: title,
		onCancel: noop,
		pricePlans: plan.pricePlans,
		onProceed: proceedFunc,
		primaryAccount: isPrimaryProfile,
		signedIn: !!account,
		selectedPlan: selectedPricePlan
	};
	return props;
}

export function getChannelInfoModalConfig(item: ItemSummary, images) {
	const props: ChannelInfoModalOwnProps = {
		id: 'channel-info-modal',
		onCancel: noop,
		item,
		images
	};
	return props;
}

function sendItemSubscribeAnalyticsEvent(item: api.ItemDetail) {
	// TA accepts show.customId so we use the show of the current Season/Show/Episode
	let playableAsset = item;

	if (isSeason(item)) {
		playableAsset = get(item, 'show');
	} else if (isEpisode(item)) {
		playableAsset = get(item, 'season.show');
	}

	stateUtil.dispatchAction(analyticsEvent(AnalyticsEventType.ITEM_SUBSCRIBE_CLICKED, { item: playableAsset }));
}

export function redirectToSubscriptions(item: api.ItemDetail, config: state.Config) {
	sendItemSubscribeAnalyticsEvent(item);

	const pathname = getSubscriptionPagePath(config);
	let path = pathname + '?';

	const pricePlanIds = item.offers.map(offer => offer.subscriptionCode);
	if (pricePlanIds.length > 1) {
		path += `priceplans=${pricePlanIds.join(',')}`;
	} else if (pricePlanIds.length === 1) {
		path += `priceplan=${pricePlanIds[0]}`;
	}
	browserHistory.push(path);
}

export function redirectToResubscribe(subscription: api.Subscription, config: state.Config) {
	const pathname = getSubscriptionPagePath(config);
	const resubscribePlanId = get(subscription, 'planId');

	browserHistory.replace(pathname + (resubscribePlanId ? `?priceplan=${resubscribePlanId}&resubscribe=true` : ''));
}

export function getExpiredSubscriptionTitle(length: number): string {
	return `@{account.billing.expired.subscriptions} (${length})`;
}

export function getViewAllButtonLabel(length: number): string {
	return length > 1 ? `@{account.billing.viewAll}` : `@{account.billing.view}`;
}

export function redirectToSignPage(config, redirectPath?: string) {
	const redirect = redirectPath ? `?redirect=${redirectPath}` : '';
	browserHistory.push(`/${getSignInPath(config)}${redirect}`);
}

export function redirectToRegisterPage(config) {
	browserHistory.push(`/${getRegisterPath(config)}`);
}

export function getSubscriptionPagePath(config) {
	return getPathByKey(pricePlanPageKey, config);
}

export function getGSTAmount(totalPrice: number): number {
	const clientGstRate = process.env.CLIENT_GST_RATE;
	const gstRate = clientGstRate && !isNaN(clientGstRate) ? parseFloat(clientGstRate) : DEFAULT_GST_RATE;
	const rateAmount = (totalPrice / ((100 + gstRate) / 100)) * (gstRate / 100);
	return parseFloat(rateAmount.toFixed(2));
}

export enum USER_REQUIREMENT {
	NONE,
	UPSELL,
	SIGNIN_REQUIRED,
	SUBSCRIPTION_REQUIRED
}
export const getUserActionRequirement = (isSignedInUser, item): USER_REQUIREMENT => {
	if (!isSignedInUser && !isRegistrationOnlyRequired(item)) {
		return USER_REQUIREMENT.UPSELL;
	} else if (isRegistrationOnlyRequired(item)) {
		return USER_REQUIREMENT.SIGNIN_REQUIRED;
	}

	return canPlay(item) ? USER_REQUIREMENT.NONE : USER_REQUIREMENT.SUBSCRIPTION_REQUIRED;
};

export function getSubscriptionSummaryPage(config, pricePlanId, promocode?) {
	const subscriptionsHomePath = getPathByKey(PricePlanPageKey, config);
	const pageSummary = findPageSummaryByPath(location.pathname, config);
	const isSubscriptionsPage = pageSummary.template === PricePlanPageKey;

	const queryString = {
		gotosummary: true,
		priceplan: pricePlanId,
		promocode
	};

	// If yes, use current page path for redirect, else use subscriptions home page path
	return addQueryParameterToURL(isSubscriptionsPage ? location.pathname : subscriptionsHomePath, queryString);
}
