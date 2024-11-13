import { useRouterHistory } from 'react-router';
import { createHistory as createBrowserHistory, createHashHistory, useBeforeUnload } from 'history';

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
const BASENAME = process.env.CLIENT_BASENAME;
const createHistory = _TV_ ? createHashHistory : createBrowserHistory;

export const browserHistory = canUseDOM
	? useRouterHistory(useBeforeUnload(createHistory))({ basename: BASENAME })
	: undefined;
