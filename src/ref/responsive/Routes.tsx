import * as React from 'react';
import * as Redux from 'redux';
import { IndexRoute } from 'react-router';
import PageNotFound from './page/PageNotFound';
import App from './App';
import AppChromeless from './AppChromeless';
import AppCommon from './AppCommon';
import AuthPage from 'ref/responsive/page/auth/AuthPage';
import RegistrationPage from 'ref/responsive/page/account/registration/RegistrationPage';

import { Route, pageKey as key, pageTemplate as template, resolvePath as path, loadRoute as load } from 'shared/';

/* tslint:disable */
export default function routes(s: Redux.Store<state.Root>) {
	return (
		<Route>
			<Route component={AppCommon}>
				<Route getPath={path(template.Home, s)} component={App}>
					<IndexRoute
						getComponent={(_, cb) => load(import(/* webpackChunkName: "category" */ './page/home/Home'), cb)}
					/>
					<Route
						getPath={path(template.Account, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "account" */ './page/account/Account'), cb)}
					/>
					<Route
						getPath={path(`@${key.AccountEdit}`, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "account" */ './page/account/AccountEdit'), cb)}
					/>
					<Route
						getPath={path(`@${key.AccountAddCard}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ './page/account/AccountAddCard'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountAddCredit}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ './page/account/AccountAddCredit'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountBilling}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ './page/account/AccountBilling'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountChangePassword}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ './page/account/AccountChangePassword'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountLibrary}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ './page/account/AccountLibrary'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountParentalLock}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ './page/account/AccountParentalLock'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileBookmarks}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/AccountProfileBookmarks'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileChangePin}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/AccountProfileChangePin'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileEdit}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/profile/ProfileEdit'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileAdd}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/profile/ProfileAdd'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileResetPin}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/AccountProfileResetPin'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfiles}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/AccountProfiles'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountProfileWatched}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/AccountProfileWatched'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.AccountPreferences}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "profile" */ './page/account/AccountPreferences'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.ConfirmAccount}`, s)}
						getComponent={(_, cb) => load(import('./page/account/AccountConfirmed'), cb)}
					/>
					<Route
						getPath={path(`@${key.AccountDeviceAuthorization}`, s)}
						getComponent={(_, cb) =>
							load(import(/* webpackChunkName: "account" */ './page/account/AccountDeviceAuthorization'), cb)
						}
					/>
					<Route
						getPath={path(`@${key.ConfirmEmail}`, s)}
						getComponent={(_, cb) => load(import('./page/account/EmailConfirmed'), cb)}
					/>
					<Route
						getPath={path(template.Category, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "category" */ './page/category/Category'), cb)}
					/>
					<Route
						getPath={path(template.ItemDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "item" */ './page/item/ItemDetail'), cb)}
					/>
					<Route
						getPath={path(template.MovieDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "item" */ './page/item/ItemDetail'), cb)}
					/>
					<Route
						getPath={path(template.ProgramDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "item" */ './page/item/ItemDetail'), cb)}
					/>
					<Route
						getPath={path(template.CustomDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "item" */ './page/item/ItemDetail'), cb)}
					/>
					<Route
						getPath={path(template.ShowDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "item" */ './page/item/ItemDetail'), cb)}
					/>
					<Route
						getPath={path(template.ChannelDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "item" */ './page/item/ItemDetail'), cb)}
					/>
					<Route
						getPath={path(template.ListDetail, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "list" */ './page/list/ListDetail'), cb)}
					/>
					<Route
						getPath={path(template.ListDetailFeatured, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "list" */ './page/list/ListDetailFeatured'), cb)}
					/>
					<Route
						getPath={path(`@${key.PlanSelection}`, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "register" */ './page/plan/Plans'), cb)}
					/>
					<Route
						getPath={path(`@${key.PlanBilling}`, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "register" */ './page/plan/PlanBilling'), cb)}
					/>
					<Route
						getPath={path(`@${key.CreatePin}`, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "register" */ './page/account/CreatePin'), cb)}
					/>
					<Route
						getPath={path(template.Search, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "search" */ './page/search/Search'), cb)}
					/>
					<Route
						getPath={path(template.SubCategory, s)}
						getComponent={(_, cb) => load(import(/* webpackChunkName: "category" */ './page/category/SubCategory'), cb)}
					/>
					<Route
						getPath={path(template.Support, s)}
						getComponent={(_, cb) => load(import('./page/support/Support'), cb)}
					/>
					<Route
						getPath={path(template.Editorial, s)}
						getComponent={(_, cb) => load(import('./page/support/Editorial'), cb)}
					/>
					<Route getPath={path(template.EPG, s)} getComponent={(_, cb) => load(import('./page/epg/EPG'), cb)} />
					<Route
						getPath={path(template.WebView, s)}
						getComponent={(_, cb) => load(import('./page/webview/WebView'), cb)}
					/>
				</Route>

				<Route component={AppChromeless}>
					<Route component={AuthPage}>
						<Route
							getPath={path(`@${key.SignIn}`, s)}
							getComponent={(_, cb) => load(import(/* webpackChunkName: "auth" */ './page/auth/SignInForm'), cb)}
						/>
						<Route
							getPath={path(`@${key.ResetPassword}`, s)}
							getComponent={(_, cb) => load(import(/* webpackChunkName: "auth" */ './page/auth/ResetPassword'), cb)}
						/>
					</Route>
					<Route
						getPath={path(template.Watch, s)}
						getComponent={(_, cb) => load /* webpackChunkName: "watch" */(import('./page/player/Watch'), cb)}
					/>
					<Route component={RegistrationPage}>
						<Route
							getPath={path(`@${key.Register}`, s)}
							getComponent={(_, cb) =>
								load(import(/* webpackChunkName: "auth" */ './page/account/AccountRegister'), cb)
							}
						/>
					</Route>
				</Route>
			</Route>

			<Route path="*" component={PageNotFound} />
		</Route>
	);
}
