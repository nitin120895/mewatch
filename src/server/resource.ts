import * as URL from 'url';
import settings from './settings';
import { getHtmlDefaults, loadFile, saveFile, genHash, replaceAssetUrl } from './util';
import { renderHtml } from './html';

export let shellHtml = '';

export async function initResources() {
	const info = await initStaticResources();
	shellHtml = info.shell.data;
	getHtmlDefaults(); // warm defaults cache
}

async function initStaticResources() {
	initManifest();
	const shell = await initAppShell();
	initServiceWorker(shell);
	return { shell };
}

function initManifest() {
	const filename = 'manifest.json';
	const contents = loadFile(filename);
	if (!contents) return;

	let data = replaceAssetUrl(contents);
	data = replaceAppShellPath(data);
	settings.themeColor = JSON.parse(data).theme_color;
	settings.manifestFilename = filename;

	saveFile(filename, data);
	return { filename, data };
}

async function initAppShell() {
	const data = await renderHtml({ externalCss: true }, undefined, undefined);
	return { data };
}

function initServiceWorker(shellInfo) {
	let sw = loadFile('sw.js');
	if (!sw) return;
	sw = replaceAssetUrl(sw);

	// Our shell fallback html needs to be generated when the server
	// runs and not at compilation time as it's based on env variables fed in at runtime.
	// We want our service worker to load, cache and use this shell so it doesn't need to
	// go to the server for the index html once the service worker has kicked in, even
	// when offline. We hash the contents of the shell html so if anything changes the
	// service worker can see the change and reload it.
	const precacheAssets = [[settings.appShellPath, genHash(shellInfo.data)]];

	const origin1 = settings.rocket.host;
	const origin2 = settings.rocketCdn.host;

	if (origin1 === origin2) {
		sw = sw.replace('{{ROCKET_SERVICE_ORIGIN}}', origin1);
	} else {
		const origin = new RegExp(`(${origin1}|${origin2})`);
		sw = sw.replace('"{{ROCKET_SERVICE_ORIGIN}}"', origin.toString());
	}

	sw = replaceAppShellPath(sw);
	sw = sw.replace('"{{PRECACHE_ASSETS}}"', JSON.stringify(precacheAssets));
	sw = sw.replace('{{IMAGE_SERVICE_ORIGIN}}', URL.parse(settings.clientAssetUrl).host || '');

	saveFile('sw.js', sw);
}

function replaceAppShellPath(contents: string): string {
	return contents.replace('{{APP_SHELL_PATH}}', settings.appShellPath);
}
