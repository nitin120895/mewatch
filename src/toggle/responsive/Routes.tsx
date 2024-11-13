import * as React from 'react';
import * as Redux from 'redux';
import { IndexRoute } from 'react-router';
import UnsupportedBrowser from 'toggle/responsive/page/UnsupportedBrowser';
import PageNotFound from 'ref/responsive/page/PageNotFound';
import AppCommon from 'ref/responsive/AppCommon';
import App from 'ref/responsive/App';
import AppChromeless from 'ref/responsive/AppChromeless';
import AuthPage from 'ref/responsive/page/auth/AuthPage';
import RegistrationPage from 'ref/responsive/page/account/registration/RegistrationPage';
import DownloadICS, { DOWNLOAD_ICS_PAGE_PATH } from 'toggle/responsive/component/AddToCalendarButton/DownloadICS';
import { isSubprofilesFeatureEnabled } from './util/profileUtil';

import { Route, pageKey as key, pageTemplate as template, resolvePath as path, loadRoute as load } from 'shared/';

/* tslint:disable */
export default function routes(s: Redux.Store<state.Root>) {
	return (
		<Route>
			<Route component={AppCommon}>
				<Route getPath={path(template.Home, s)} component={App}>
					<IndexRoute
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "category" */ 'ref/responsive/page/home/Home'), cb)
						}
					/>
					<Route
						getPath={path(template.Account, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/Account'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountEdit}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountEdit'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountAddCard}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountAddCard'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountAddCredit}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountAddCredit'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountBilling}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountBilling'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountChangePassword}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountChangePassword'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountLibrary}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountLibrary'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountParentalLock}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountParentalLock'), cb)
						}
					/>
					<Route
						getPath={path(template.MyList, s)}
						getComponent={(_, cb) =>
							load(
								import(/* webpackChunkName: "profile" */ 'toggle/responsive/page/account/AccountProfileBookmarks'),
								cb
							)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileChangePin}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ 'ref/responsive/page/account/AccountProfileChangePin'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileEdit}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ 'ref/responsive/page/account/profile/ProfileEdit'), cb)
						}
					/>
					{isSubprofilesFeatureEnabled && (
						<Route
							getPath={path(`@${key.AccountProfileAdd}`, s)}
							getComponent={(_, cb) =>
								load(import(/* webpackChunkName: "profile" */ 'ref/responsive/page/account/profile/ProfileAdd'), cb)
							}
						/>
					)}
					<Route
						getPath={path(`@${key.AccountProfilePersonalisation}`, s)}
						getComponent={(_, cb) =>
							load(
								import(/* webpackChunkName: "profile" */ 'toggle/responsive/page/account/profile/ProfilePersonalisationPreferences'),
								cb
							)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileResetPin}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ 'ref/responsive/page/account/AccountProfileResetPin'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfiles}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ 'ref/responsive/page/account/AccountProfiles'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileWatched}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ 'ref/responsive/page/account/AccountProfileWatched'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountPreferences}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ 'ref/responsive/page/account/AccountPreferences'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.ConfirmAccount}`, s)}
						getComponent={(_, cb) => load(import('ref/responsive/page/account/AccountConfirmed'), cb)}
					/>
					<Route
						getPath={path(`@${key.AccountDeviceAuthorization}`, s)}
						getComponent={(_, cb) =>
							load(
								import(/* webpackChunkName: "account" */ 'ref/responsive/page/account/AccountDeviceAuthorization'),
								cb
							)
						}
					/>
					<Route
						getPath={path(`@${key.ConfirmEmail}`, s)}
						getComponent={(_, cb) => load(import('ref/responsive/page/account/EmailConfirmed'), cb)}
					/>
					<Route
						getPath={path(template.Category, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "category" */ 'ref/responsive/page/category/Category'), cb)
						}
					/>
					<Route
						getPath={path(template.ContinueWatch, s)}
						getComponent={(_, cb) => load(import('toggle/responsive/page/continueWatching/ContinueWatching'), cb)}
					/>
					<Route
						getPath={path(template.ItemDetail, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "item" */ 'ref/responsive/page/item/ItemDetail'), cb)
						}
					/>
					<Route
						getPath={path(template.MovieDetail, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "item" */ 'ref/responsive/page/item/ItemDetail'), cb)
						}
					/>
					<Route
						getPath={path(template.ProgramDetail, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "item" */ 'ref/responsive/page/item/ItemDetail'), cb)
						}
					/>
					<Route
						getPath={path(template.ShowDetail, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "item" */ 'ref/responsive/page/item/ItemDetail'), cb)
						}
					/>
					<Route
						getPath={path(template.ListDetail, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "list" */ 'ref/responsive/page/list/ListDetail'), cb)
						}
					/>
					<Route
						getPath={path(template.ListDetailFeatured, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "list" */ 'ref/responsive/page/list/ListDetailFeatured'), cb)
						}
					/>
					<Route
						getPath={path(template.ChannelDetail, s)}
						getComponent={(_, cb) => load(import('toggle/responsive/page/channel/ChannelDetail'), cb)}
					/>
					<Route
						getPath={path(template.CustomDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "item" */ './page/item/ItemDetail'), cb)}
					/>
					<Route
						getPath={path(`@${key.PlanSelection}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "register" */ 'ref/responsive/page/plan/Plans'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.PlanBilling}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "register" */ 'ref/responsive/page/plan/PlanBilling'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.CreatePin}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "register" */ 'ref/responsive/page/account/CreatePin'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.SubscriptionStaff}`, s)}
						getComponent={(_, cb) =>
							load(
								import(/* webpackChunkName: "register" */ 'toggle/responsive/page/subscription/SubscriptionsStaff'),
								cb
							)
						}
					/>
					<Route
						getPath={path(`@${key.ESearch}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "esearch" */ 'toggle/responsive/page/enhancedSearch/EnhancedSearch'), cb)
						}
					/>
					<Route
						getPath={path(template.Search, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "search" */ 'ref/responsive/page/search/Search'), cb)
						}
					/>
					<Route
						getPath={path(template.SubCategory, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "category" */ 'ref/responsive/page/category/SubCategory'), cb)
						}
					/>
					<Route
						getPath={path(template.Support, s)}
						getComponent={(_, cb) => load(import('ref/responsive/page/support/Support'), cb)}
					/>
					<Route
						getPath={path(template.Editorial, s)}
						getComponent={(_, cb) => load(import('ref/responsive/page/support/Editorial'), cb)}
					/>
					<Route
						getPath={path(template.EPG, s)}
						getComponent={(_, cb) => load(import('ref/responsive/page/epg/EPG'), cb)}
					/>
					<Route
						getPath={path(template.Subscription, s)}
						getComponent={(_, cb) => load(import('toggle/responsive/page/subscription/Subscriptions'), cb)}
					/>
					<Route
						getPath={path(template.WebView, s)}
						getComponent={(_, cb) => load(import('ref/responsive/page/webview/WebView'), cb)}
					/>
					<Route
						getPath={path(template.SportsEvent, s)}
						getComponent={(_, cb) => load(import('toggle/responsive/page/gamesSchedule/SportsEvent'), cb)}
					/>
					<Route
						getPath={path(template.LiveChannels, s)}
						getComponent={(_, cb) => load(import('toggle/responsive/page/liveChannels/LiveChannels'), cb)}
					/>
				</Route>

				<Route component={AppChromeless}>
					<Route
						getPath={path(template.ColdStart, s)}
						getComponent={(_, cb) => load(import('toggle/responsive/page/account/profile/ColdStart'), cb)}
					/>
					<Route
						getPath={path(`@${key.Embed}`, s)}
						getComponent={(_, cb) => load(import('toggle/responsive/page/Embed'), cb)}
					/>
				</Route>

				<Route component={AppChromeless}>
					<Route component={AuthPage}>
						<Route
							getPath={path(`@${key.SignIn}`, s)}
							getComponent={(_, cb) =>
								load(import(/* webpackChunkName: "auth" */ 'ref/responsive/page/auth/SignInForm'), cb)
							}
						/>
						<Route
							getPath={path(`@${key.ResetPassword}`, s)}
							getComponent={(_, cb) => load(import(/* webpackChunkName: "auth" */ './page/auth/ResetPassword'), cb)}
						/>
					</Route>
					<Route
						getPath={path(`@${key.Watch}`, s)}
						getComponent={(_, cb) =>
							load /* webpackChunkName: "watch" */(import('ref/responsive/page/player/Watch'), cb)
						}
					/>
					<Route component={RegistrationPage}>
						<Route
							getPath={path(`@${key.Register}`, s)}
							getComponent={(_, cb) =>
								load(import(/* webpackChunkName: "auth" */ 'ref/responsive/page/account/AccountRegister'), cb)
							}
						/>
					</Route>
				</Route>
			</Route>

			<Route component={AppChromeless}>
				<Route path="unsupported-browser" component={UnsupportedBrowser} />
				<Route path={DOWNLOAD_ICS_PAGE_PATH} component={DownloadICS} />
			</Route>

			<Route component={App}>
				<Route path="*" component={PageNotFound} />
			</Route>
		</Route>
	);
}
