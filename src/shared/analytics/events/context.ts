import { merge } from 'rxjs';
import {
	mergeMap,
	distinctUntilKeyChanged,
	filter,
	map,
	pairwise,
	sample,
	scan,
	share,
	startWith,
	take,
	tap,
	throttleTime
} from 'rxjs/operators';
import { selectActivePage, selectPreviousPagePath } from 'shared/page/pageUtil';
import { compareKey } from '../../util/function';
import { isObject } from '../../util/objects';
import { getItem as getSessionStorage, setItem as setSessionStorage } from '../../util/sessionStorage';
import { getPageAsEntry, getPageContext, getSessionContext, getUserContext, getReferenceId } from '../getContext';
import { StreamHandler } from '../types/stream';
import { DomEventItem, DomEventSourceType, EventName } from '../types/types';
import { GET_PAGE_DETAIL, GetPageDetailAction } from '../types/v3/action/redux-actions';
import { ContextProperty } from '../types/v3/context';
import { isActionOfType, isEventOfSource, isEventOfType } from '../util/stream';
import { isAnonymousUser } from '../../account/sessionWorkflow';

const selectAccountInfo = (state: Pick<state.Root, 'account' | 'app' | 'session'>) => {
	const {
		session,
		account: { info },
		app: {
			contentFilters: { segments },
			config
		}
	} = state;
	const plans = config && config.subscription && config.subscription.plans;
	return state.account && { info, segments, plans, session };
};

export const contextStream: StreamHandler = function contextStreamHandler({ STATE, DOM_EVENT, ACTION, CONTEXT }) {
	const page$ = STATE.pipe(
		filter(isObject),
		map(selectActivePage),
		share()
	);

	const domEntryContext$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource<DomEventSourceType.Item, DomEventItem>(DomEventSourceType.Item),
		filter(event => isObject(event.data.entry)),
		map(event => ({ entry: event.data.entry }))
	);

	const pageEntryContext$ = page$.pipe(
		sample(ACTION.pipe(isActionOfType<GetPageDetailAction>(GET_PAGE_DETAIL))),
		map(page => ({ entry: getPageAsEntry(page) }))
	);

	const entryContext$ = merge(domEntryContext$, pageEntryContext$.pipe(take(1)));

	const pageContext$ = page$.pipe(
		map(page => getPageContext(page)),
		mergeMap(pageInfo =>
			STATE.pipe(
				filter(isObject),
				map(selectPreviousPagePath),
				map(prevPath => ({ page: { ...pageInfo, prevPath } }))
			)
		)
	);

	const lastActivity$ = merge(
		pageContext$,
		DOM_EVENT.pipe(
			throttleTime(1000),
			map(() => Date.now()),
			tap(time => setSessionStorage('analytics.lastActivityTime', time)),
			startWith(getSessionStorage('analytics.lastActivityTime') || Date.now())
		)
	);

	const sessionContext$ = lastActivity$.pipe(
		pairwise(),
		map(([previous, now]) => now - previous),
		map(idleTimeMs => ({ session: getSessionContext(idleTimeMs) })),
		distinctUntilKeyChanged('session', compareKey('id')),
		share()
	);

	const userContext$ = STATE.pipe(
		filter(isObject),
		distinctUntilKeyChanged('account'),
		filter(({ account }) => isObject(account)),
		map(selectAccountInfo),
		mergeMap(accountInfo => userSessionContext$(accountInfo))
	);

	const userSessionContext$ = accountInfo =>
		STATE.pipe(
			filter(isObject),
			distinctUntilKeyChanged('session'),
			filter(({ session }) => isObject(session)),
			map(store => ({
				user: {
					...getUserContext(accountInfo),
					referenceId: isAnonymousUser(store) ? undefined : getReferenceId(store.session.tokens),
					cxRandomId: store.session.cxRandomId
				}
			}))
		);

	// We need to merge the first context value because we want it carried across subscriptions!
	// (otherwise the first context value emitted would replace the context (it would be used as the "seed")
	const context$ = merge(CONTEXT.pipe(take(1)), entryContext$, pageContext$, sessionContext$, userContext$).pipe(
		scan<ContextProperty>((ctx, value) => ({ ...ctx, ...value })),
		share()
	);

	return {
		CONTEXT: context$
	};
};
