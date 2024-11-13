import * as React from 'react';
import * as Redux from 'redux';
import * as newrelic from 'newrelic';
import { ServerRoot } from '../shared/app/Root';
import { getHtmlDefaults, renderScript, getString, getIntlProps, bestLanguage, getDynamicHeaderLinks } from './util';
import { formatCspHtml } from './security/csp/policy';
import { renderToString } from 'react-dom/server';
import { minify } from 'html-minifier';
import { Helmet } from 'react-helmet';
import settings from './settings';

const genHtml = _TV_ ? require('resource/ref/tv/index.html.js').template : require('resource/index.html.js').template;

export function renderHtml(renderProps, store, req): Promise<any> {
	try {
		return getHtmlProps(renderProps, store, req).then(p => {
			let html = genHtml(p, newrelic);
			html = formatHtml(html);
			html = formatCspHtml(html);
			return html;
		});
	} catch (error) {
		return Promise.reject(error);
	}
}

function getHtmlProps(renderProps, store: Redux.Store<state.Root>, req) {
	const lang = bestLanguage(req);

	return renderApp(renderProps, store, req, lang).then(app => {
		const head = app.head;
		const htmlDefaults = getHtmlDefaults();

		const scripts = [head.script.toString()];
		const bodyScripts = htmlDefaults.bodyScripts.slice();
		if (app.state) {
			bodyScripts.unshift(renderScript(app.state));
		}

		const extra = getDynamicHeaderLinks(store);
		const links = (htmlDefaults.links || []).concat(extra.links);
		const styles = (htmlDefaults.styles || []).concat(extra.styles);

		if (head.link) {
			// canonical
			links.unshift(head.link.toString());
		}

		return {
			lang,
			viewport: settings.viewport,
			locales: settings.locales,
			meta: htmlDefaults.meta.concat([head.meta.toString()]),
			title: head.title.toString() || getString('app_title', lang),
			styles,
			links,
			scripts,
			bodyScripts,
			body: app.body
		};
	});
}

function renderApp(renderProps, store, req, lang): Promise<any> {
	if (!store || !_SSR_)
		return Promise.resolve({
			state: '',
			body: renderAppShellBody(store),
			head: {
				script: '',
				title: '',
				meta: ''
			}
		});

	return new Promise((resolve, reject) => {
		try {
			const body = renderToString(<ServerRoot store={store} renderProps={renderProps} {...getIntlProps(lang)} />);
			const head = Helmet.rewind();
			const state = renderState(store);
			resolve({ state, body, head });
		} catch (e) {
			// We could use a .catch but that'll be handled async, which if we're in the middle
			// of handling another request, might wipe the helmet unnecessarily.

			// something went wrong rendering our app! Make sure we rewind the helmet
			// as if we rendered a helmet (which we probably did) - it keeps a hold of
			// our entire component tree, causing a memory leak!
			Helmet.rewind();
			// keep propagating the error up so others can handle it
			reject(e);
		}
	});
}

function renderState(store: Redux.Store<state.Root>) {
	return {
		data: `window.__data = ${JSON.stringify(store.getState())}`
	};
}

/**
 * Render the body html to be displayed before the single page app
 * takes over.
 *
 * In general we'll server render page content, but in the context
 * of a Service Worker we'll have a minimal index page cached locally.
 * This is used to avoid the need to go back to the server on repeat
 * visits for a server render.
 *
 * When it kicks in it will have a (very) short period where you can
 * display some pre-rendered content.
 *
 * The current default doesn't really render anything but
 * helps our Lighthouse score while the following bug exists.
 *
 * - https://github.com/GoogleChrome/lighthouse/issues/2096
 * - https://github.com/GoogleChrome/lighthouse/issues/2595 (duplicate with more details)
 *
 * @param store redux store
 */
function renderAppShellBody(store: Redux.Store<state.Root>): string {
	return `<main>
<style>.app-shell-loading{opacity:0;}</style>
<span class="app-shell-loading">Loading...</span>
</main>`;
}

function formatHtml(html) {
	if (_DEV_) return html;

	return minify(html, {
		collapseWhitespace: true,
		collapseInlineTagWhitespace: false
	});
}
