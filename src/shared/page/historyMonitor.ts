import * as Redux from 'redux';
import { pageChange, pageParamsUpdated } from './pageWorkflow';
import { saveScrollPosition } from './pagePersistence';
import { browserHistory } from '../util/browserHistory';
import { isSameLocation, isQueryChange } from '../util/locations';
import { ssoPortalSignIn } from '../account/sessionWorkflow';
import { getAccount } from '../account/accountUtil';

/**
 * When history changes, dispatch a redux action so we can trigger any
 * required page loading from services.
 *
 * Also track the index of the browser entry and persist this index to
 * session storage. This allows us to carry on tracking of history index
 * even after page refresh, which helps us know which orphaned
 * page entries to purge from from local memory after a PUSH occurs.
 */
export function monitorHistory(store: Redux.Store<state.Root>) {
	if (_SERVER_) return;

	let loc;

	/**
	 * Checks to see if the current location and the new location that is being pushed into the history are the same.
	 * If the same, we want to prevent the new location from being pushed as this will create duplicate entries in the history.
	 */
	browserHistory.listenBefore((nextLoc: any) => {
		saveScrollPosition(store.getState());
		const proceed = !isPushingCurrentLocation(loc, nextLoc);
		if (proceed && !getAccount()) {
			store.dispatch(ssoPortalSignIn());
		}
		return proceed;
	});

	browserHistory.listen((currentLoc: any) => {
		const queryParamsUpdated = isUpdatingQuery(loc, currentLoc);
		loc = currentLoc;
		if (queryParamsUpdated) {
			store.dispatch(pageParamsUpdated(currentLoc));
		} else {
			store.dispatch(pageChange(currentLoc));
		}
	});
}

function isPushingCurrentLocation(loc, nextLoc): boolean {
	return nextLoc.action === 'PUSH' && isSameLocation(loc, nextLoc);
}

/**
 * If we're simply updating the search query param of the current page,
 * don't trigger a page change event.
 *
 * Pages from Presentation Manager are all path based. This means
 * after the first load of a page, if its 'search' or 'hash' property
 * changes it shouldn't be seen as a full page reload, instead these should
 * trigger localized granular loading specific to the internals of that page.
 */
function isUpdatingQuery(loc, nextLoc) {
	return nextLoc.action === 'REPLACE' && isQueryChange(loc, nextLoc);
}
