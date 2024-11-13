import { Store } from 'redux';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { findPageSummary, PAGE_404 } from 'shared/page/sitemapLookup';
import { browserHistory as history } from 'shared/util/browserHistory';
import { getPage } from 'shared/service/app';

/**
 * According to "Deep-link Return Key Policy" of samsung,
 * application must be quit without confirmation in deep-link mode.
 * @See https://developer.samsung.com/tv/develop/guides/smart-hub-preview
 */
export async function handleDeepLink(path: string, store: Store<state.Root>) {
	const state = store.getState();
	if (state.app.contentFilters.device === 'tv_samsung') {
		DirectionalNavigation.exitWithoutConfirm = true;
	}
	const page = findPageSummary(path, state);
	if (page !== PAGE_404) {
		// verify path is valid if page is dynamic.
		if (page.isStatic) {
			history.push(path);
		} else {
			const { error, data } = await getPage(path);
			if (!error && data && data.path) {
				history.push(data.path);
			}
		}
	}
}
