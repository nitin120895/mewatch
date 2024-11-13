import * as React from 'react';
import * as Redux from 'redux';
import { IndexRoute } from 'react-router';
import PageNotFound from './page/PageNotFound';
import App from './App';
import { Route, pageKey as key, pageTemplate as template, resolvePath as path, loadRoute as load } from 'shared/';

export default function routes(s: Redux.Store<state.Root>) {
	return (
		<Route getPath={path(template.Home, s)} component={App}>
			<IndexRoute getComponent={(_, cb) => load(import(/* webpackChunkName: "category" */ './page/home/Home'), cb)} />
			<Route
				getPath={path(template.Category, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "category" */ './page/category/Category'), cb)}
			/>
			<Route
				getPath={path(template.SubCategory, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "category" */ './page/category/SubCategory'), cb)}
			/>
			<Route
				getPath={path(template.Search, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "search" */ './page/search/Search'), cb)}
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
				getPath={path(template.ListDetailFeatured, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "list" */ './page/list/ListDetailFeatured'), cb)}
			/>
			<Route
				getPath={path(template.ListDetail, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "list" */ './page/list/ListDetail'), cb)}
			/>
			<Route
				getPath={path(template.Account, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "account" */ './page/account/Account'), cb)}
			/>
			<Route
				getPath={path(template.Support, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "support" */ './page/support/Support'), cb)}
			/>
			<Route
				getPath={path(template.Editorial, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "editorial" */ './page/support/Editorial'), cb)}
			/>
			<Route
				getPath={path(template.Watch, s)}
				getComponent={(_, cb) => load(import(/* webpackChunkName: "watch" */ './page/player/Watch'), cb)}
			/>
			<Route
				getPath={path(`@${key.AccountProfileBookmarks}`, s)}
				getComponent={(_, cb) =>
					load(import(/* webpackChunkName: "profile" */ './page/account/accountprofile/AccountProfileBookmarks'), cb)
				}
			/>
			<Route
				getPath={path(`@${key.AccountProfileWatched}`, s)}
				getComponent={(_, cb) =>
					load(import(/* webpackChunkName: "profile" */ './page/account/accountprofile/AccountProfileWatched'), cb)
				}
			/>
			<Route path="*" component={PageNotFound} />
		</Route>
	);
}
