/**
 * Reference App Component Routes
 *
 * Replace this file with your own implementation within `src/viewer/${company}`.
 *
 * You're welcome to include any of our pages within your project or ignore them
 * all and supply your own.
 */

// Because we're consuming this file in both the shell app and the iframe app
// the Component references unfortunately get compiled into the shell app unnecessarily.
// This is acceptable for now considering this is an internal convenience tool and
// won't be used in production.

import Page from './Page';
import PageNotFound from 'ref/tv/page/PageNotFound';
import Home from '../tv/page/Home';
import H7MosaicComponent from '../tv/page/entries/heroes/H7MosaicComponent';
import H9ImageComponent from '../tv/page/entries/heroes/H9ImageComponent';

// We're defining our routes using the `ReactRouter.RouteConfig` syntax instead of
// JSX so that they can be consumed by both React Router, as well as our side navigation
// bar which isn't using it.
// We've extended its typings to include a title property which is used for the link text.
const routes: any = {
	path: '/',
	component: Page,
	title: 'Table of Contents',
	indexRoute: { component: Home },
	childRoutes: [
		{
			path: 'entries',
			title: 'Page Entries',
			childRoutes: [
				// Follow the group and entry naming scheme from `shared/page/pageEntryTemplate.ts`.
				{
					path: 'heroes',
					title: 'Hero Header Rows',
					childRoutes: [
						{ path: 'h7', component: H7MosaicComponent, title: 'H7 - Mosaic' },
						{ path: 'h9', component: H9ImageComponent, title: 'H9 - Image' }
					]
				}
			]
		},
		{
			path: '*',
			component: PageNotFound,
			title: '404'
		}
	]
};

export default routes;
