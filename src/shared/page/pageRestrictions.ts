import { Account as AccountKey } from './pageKey';
import { Account as AccountTemplate } from './pageTemplate';
import restrictedPageKey from './restrictedPageKey';
import { AccountProfileResetPin as AccountProfileResetPinPageKey } from 'shared/page/pageKey';

export function isRestrictedPage(page: api.PageSummary, location?: HistoryLocation): boolean {
	return isRestrictedKey(page.key) || isRestrictedTemplate(page.template);
}

function isRestrictedKey(key: string): boolean {
	if (!key) key = '';
	return key.startsWith(AccountKey) || restrictedPageKey.includes(key);
}

function isRestrictedTemplate(template: string): boolean {
	if (!template) template = '';
	return template.startsWith(AccountTemplate);
}

export function canRenderAppCommonChildren(
	session: state.Session,
	account: state.Account,
	pageSummary: api.PageSummary
) {
	const pageCanBeRendered = pageSummary.key === AccountProfileResetPinPageKey;
	const isActiveAccount = account.active;
	const isSignedIn = !!session.tokens.length && isActiveAccount;
	return pageCanBeRendered || session.profileSelected || !isSignedIn || !isActiveAccount;
}
