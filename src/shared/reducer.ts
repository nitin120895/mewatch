import { combineReducers } from 'redux';
import app from './app/appWorkflow';
import player from './app/playerWorkflow';
import cache from './cache/cacheWorkflow';
import page from './page/pageWorkflow';
import list from './list/listWorkflow';
import search from './search/searchWorkflow';
import session from './account/sessionWorkflow';
import account from './account/accountWorkflow';
import profile from './account/profileWorkflow';
import uiLayer from './uiLayer/uiLayerWorkflow';
import schedule from './app/scheduleWorkflow';
import analytics from './analytics/analyticsWorkflow';
import notifications from 'shared/notifications/notificationWorkflow';

export default combineReducers({
	app,
	cache,
	page,
	list,
	search,
	session,
	account,
	profile,
	schedule,
	uiLayer,
	player,
	analytics,
	notifications
});
