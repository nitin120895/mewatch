import { merge } from 'rxjs';
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators';
import { ANALYTICS_EVENT } from 'shared/analytics/analyticsWorkflow';
import { toEvent, withContext, withEntryContext } from 'shared/analytics/events/toEvent';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { Sources, StreamHandler } from 'shared/analytics/types/stream';
import { SUBSCRIPTION_PROMO_CODE } from 'shared/analytics/types/v3/action/redux-actions';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { isActionOfType } from 'shared/analytics/util/stream';
import { getItem, setItem } from 'shared/util/localStorage';
import { get, isObject } from 'shared/util/objects';
import { SELECTED_PRICE_PLAN } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';

export const subscriptionStreamHandler: StreamHandler = function(sources: Sources) {
	const { CONTEXT, ACTION, STATE } = sources;

	const selectedSubscriptionPlan$ = STATE.pipe(
		map(state => state && state.account && state.account.selectedPricePlan),
		filter(isObject),
		distinctUntilChanged()
	);

	const subscriptionEntryPoint$ = STATE.pipe(
		map(state => {
			if (state && state.page) {
				const { page } = state;
				const query = get(page, 'history.location.query');
				const entryPoint =
					query && query.cid ? MixpanelEntryPoint.MarketingCampaign : get(page, 'subscriptionEntryPoint');
				return { entryPoint };
			}
		}),
		distinctUntilChanged()
	);

	const subscribePage$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIBE_PAGE),
		withLatestFrom(subscriptionEntryPoint$),
		map(([event, entryPoint]) => ({ ...event, ...entryPoint })),
		toEvent(AnalyticsEventType.SUBSCRIBE_PAGE, ({ entryPoint }) => ({ entryPoint })),
		withEntryContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const subscriptionViewPlanClicked$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIPTION_VIEW_PLAN),
		toEvent(AnalyticsEventType.SUBSCRIPTION_VIEW_PLAN, ({ data: { payload } }) => ({ ...payload })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const subscribeSelectPlansClicked$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIBE_SELECT_PLANS),
		toEvent(AnalyticsEventType.SUBSCRIBE_SELECT_PLANS, ({ data: { payload } }) => ({ ...payload })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const subscribeProceedToPay$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAY),
		withLatestFrom(selectedSubscriptionPlan$),
		map(([event, plan]) => ({ ...event, plan })),
		toEvent(AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAY, ({ plan }) => ({ plan })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const subscribeProceedToPayment$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAYMENT),
		withLatestFrom(selectedSubscriptionPlan$),
		map(([event, plan]) => ({ ...event, plan })),
		toEvent(AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAYMENT, ({ plan }) => ({ plan })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const subscribeConfirmAndProceed$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIBE_CONFIRM_AND_PROCEED),
		withLatestFrom(selectedSubscriptionPlan$),
		map(([event, plan]) => {
			setItem(SELECTED_PRICE_PLAN, plan);
			return { ...event, plan };
		}),
		toEvent(AnalyticsEventType.SUBSCRIBE_CONFIRM_AND_PROCEED, ({ plan }) => ({ plan })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	/* when you compare undefined with itself or explicitly check if a variable is !== undefined, 
	the result is always false because undefined represents the absence of a value, and comparing
	 it to itself or another undefined value will yield false. so when payload.discountedPrice = undefined and 
	 we compare typeof  payload.discountedPrice !== undefined. this always return false.
	 Hence this event triggered even remove promo code as well. */
	const subscribeApplyPromo$ = ACTION.pipe(
		isActionOfType(SUBSCRIPTION_PROMO_CODE),
		filter(({ payload }) => payload && payload.discountedPrice !== undefined),
		map(({ payload }) => payload),
		withLatestFrom(selectedSubscriptionPlan$),
		map(([event, plan]) => ({ ...event, plan })),
		toEvent(AnalyticsEventType.SUBSCRIBE_APPLY_PROMO, ({ plan }) => ({ plan })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const subscriptionFailure$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIPTION_FAILURE),
		map(event => ({ ...event, plan: getItem(SELECTED_PRICE_PLAN) })),
		toEvent(AnalyticsEventType.SUBSCRIPTION_FAILURE, ({ data, plan }) => ({ ...data, plan })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const subscriptionSuccess$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.SUBSCRIPTION_SUCCESS),
		map(event => ({ ...event, plan: getItem(SELECTED_PRICE_PLAN) })),
		toEvent(AnalyticsEventType.SUBSCRIPTION_SUCCESS, ({ data, plan }) => ({ ...data, plan })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	return {
		EVENT: merge(
			subscribePage$,
			subscriptionViewPlanClicked$,
			subscribeSelectPlansClicked$,
			subscribeApplyPromo$,
			subscribeProceedToPayment$,
			subscribeProceedToPay$,
			subscribeConfirmAndProceed$,
			subscriptionFailure$,
			subscriptionSuccess$
		)
	};
};
