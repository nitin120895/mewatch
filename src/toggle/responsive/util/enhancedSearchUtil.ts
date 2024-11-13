import { browserHistory } from 'shared/util/browserHistory';
import { get } from 'shared/util/objects';

export function isEnhancedSearchEnabled(state: state.Root) {
	const { app } = state;
	const config = app.config;
	const isEnabled = get(config, 'general.customFields.FeatureToggle.enhancedSearch.web.enabled');
	return isEnabled;
}

export function redirectOnEnhancedSearchFlag(path: string, location: HistoryLocation) {
	const query = location.query.q || '';
	const trimmed = query.trim();
	const q = query ? `?q=${encodeURIComponent(trimmed)}` : '';
	browserHistory && browserHistory.push(`${path}${q}`);
}
