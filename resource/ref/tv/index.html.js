'use strict';

const utils = require('../../utils');

const template = p =>
	`<!DOCTYPE html>
<html lang="${p.lang}">
	<head>
		<meta http-equiv="Content-Type" content="text/html, charset=UTF-8">
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		${utils.getMeta(p.meta).join('\n\t\t')}
		${(p.title || '').indexOf('<') === 0 ? p.title : `<title>${p.title}</title>`}
		${(p.links || []).join('\n\t\t')}
		${(p.styles || []).join('\n\t\t')}
		${(p.scripts || []).join('\n\t\t')}
	</head>
	<body>
		<div id="root">${p.body || ''}</div>
		<script>if (!window.Intl) {document.write('<scr'+'ipt src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.${p.locales.join(
			`,Intl.~locale.`
		)}"></sc'+'ript>');}</script>
		${(p.bodyScripts || []).join('\n')}
	</body>
</html>`;

module.exports = exports = function compile(config) {
	let params = config.htmlWebpackPlugin.options;
	params.bodyScripts = (params.bodyScripts || []).concat(utils.getManifestScripts(config.compilation.assets));
	return template(params);
};

exports.template = template;
