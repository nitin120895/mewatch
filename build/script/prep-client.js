require('shelljs/global');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const vars = require(path.resolve('./build/variables'));

const env = process.env;
const isTV = env.TV === 'true';
const PUB_DIR = './bin/app/pub';
const ICON_DIR = `${PUB_DIR}/images/icons`;
const DEFAULT_LOCALE = env.CLIENT_DEFAULT_LOCALE || 'en';
const RESOURCE_BASE = vars.resources.base;

// template variables
const stringsBundle = JSON.parse(fs.readFileSync(`${RESOURCE_BASE}/string/strings-${DEFAULT_LOCALE}.json`));
const variables = Object.assign({}, stringsBundle, env);
// pick version number from CI environement or fallback to package.json
let semverVersion = env.SemverVersion || JSON.parse(fs.readFileSync(`./package.json`)).version;
if (!!env.buildNumber) {
	semverVersion = semverVersion.replace('<buildNumber>', env.buildNumber);
}
variables.APP_VERSION = /^([0-9.]+)/.exec(semverVersion)[1];

mkdir('-p', PUB_DIR);
mkdir('-p', ICON_DIR);

// Copy static resources to be served
if (isTV) {
	if (env.WEBOS) {
		variables.WEBOS_RESOLUTION = env.RES === 'RES_720p' ? '1280x720' : '1920x1080';
		rm('./bin/*.ipk');
		cp('-rf', `${RESOURCE_BASE}/webos/*`, PUB_DIR);
		// WebOS can be deployed as a hosted app so we're creating an "empty" IPK app
		const isPackaged = env.WEBOS_HOSTED !== 'true';
		const WEBOS_IPK = isPackaged ? PUB_DIR : './bin/app/webos-ipk';
		mkdir('-p', WEBOS_IPK);
		cp('-rf', `${RESOURCE_BASE}/webos-ipk/*`, WEBOS_IPK);
		copyManifest(`${RESOURCE_BASE}/webos-ipk/appinfo.json`, `${WEBOS_IPK}/appinfo.json`);
		copyManifest(`${RESOURCE_BASE}/webos-ipk/index.html`, `${WEBOS_IPK}/index.html`);
	} else if (env.TIZEN) {
		const isPackaged = env.TIZEN_HOSTED !== 'true';
		const TIZEN_WGT = isPackaged ? PUB_DIR : './bin/app/tizen-wgt';
		const TIZEN_CONFIG = isPackaged ? `${RESOURCE_BASE}/tizen/config.xml` : `${RESOURCE_BASE}/tizen-hosted/config.xml`;
		variables.TIZEN_PREVIEW_METADATA = variables.TIZEN_PREVIEW_URL
			? `<tizen:metadata key='http://samsung.com/tv/metadata/use.preview' value='endpoint_URL=${
					variables.TIZEN_PREVIEW_URL
			  }'></tizen:metadata>`
			: '';
		mkdir('-p', TIZEN_WGT);
		cp('-rf', `${RESOURCE_BASE}/tizen/*`, TIZEN_WGT);
		copyManifest(`${RESOURCE_BASE}/tizen/.project`, `${TIZEN_WGT}/.project`);
		copyManifest(`${RESOURCE_BASE}/tizen/.tproject`, `${TIZEN_WGT}/.tproject`);
		copyManifest(TIZEN_CONFIG, `${TIZEN_WGT}/config.xml`);
	} else if (env.XBOX) {
		const isPackaged = env.XBOX_HOSTED !== 'true';
		variables.XBOX_STARTPAGE = isPackaged ? 'ms-appx-web:///index.html' : env.XBOX_STARTPAGE || env.HOSTED_URL + '/';
		variables.XBOX_DISPLAY_NAME = env.XBOX_DISPLAY_NAME || variables.app_title;
		variables.XBOX_DESCRIPTION = env.XBOX_DESCRIPTION || variables.app_title;
		cp('-rf', `${RESOURCE_BASE}/xbox/*`, PUB_DIR);
		copyManifest(`${RESOURCE_BASE}/xbox/package.appxmanifest`, `${PUB_DIR}/package.appxmanifest`);
		if (!isPackaged) {
			// prepare Xbox project for dev
			require('./post-client-static-xbox');
		}
	} else {
		const RESOURCE_BASE_WEB = vars.resources.webBase;
		cp(`${RESOURCE_BASE}/image/favicon.ico`, PUB_DIR);
		cp('-rf', `${RESOURCE_BASE_WEB}/image/icon/*`, ICON_DIR);
		copyManifest(`${RESOURCE_BASE_WEB}/webmanifest.json`, `${PUB_DIR}/manifest.json`);
	}
} else {
	cp(`${RESOURCE_BASE}/image/favicon*.png`, PUB_DIR);
	cp('-rf', `${RESOURCE_BASE}/image/icon/*`, ICON_DIR);
	copyManifest(`${RESOURCE_BASE}/webmanifest.json`, `${PUB_DIR}/manifest.json`);
}

function copyManifest(manifestTemplate, target) {
	const template = fs.readFileSync(manifestTemplate, 'utf8');
	const manifest = updateManifest(template, variables);
	saveManifest(target, manifest);
}

/**
 * Replace any string bundle tokens
 */
function updateManifest(template, variables) {
	const matches = template.match(/\$\{[\w- \$\.]+\}/g) || [];
	return matches.reduce((manifest, token) => {
		const key = token.slice(2, -1);
		token = token.replace(/[${}]/g, '\\$&');
		let value = variables[key];
		if (value === undefined) {
			console.warn(`Warning: variable ${key} isn't defined`);
			value = '';
		}
		return manifest.replace(new RegExp(token, 'g'), value);
	}, template);
}

function saveManifest(target, manifest) {
	if (manifest.charAt(0) === '<' || manifest.charAt(1) === '<') {
		// save XML as-is
		fs.writeFileSync(target, manifest, 'utf8');
	} else {
		const json = JSON.parse(manifest);
		fs.writeFileSync(target, JSON.stringify(json), 'utf8');
	}
}
