'use strict';

const utils = require('../../utils');

const template = p =>
	`<!DOCTYPE html>
<html lang="${p.lang}">
	<head>
		<meta http-equiv="Content-Type" content="text/html, charset=UTF-8">
		<meta charset="utf-8">
		<meta name="viewport" content="user-scalable=no,${p.viewport}"/>
		${utils.getMeta(p.meta).join('\n')}
		${(p.title || '').indexOf('<') === 0 ? p.title : `<title>${p.title}</title>`}
		${(p.styles || []).join('\n')}
		${(p.scripts || []).join('\n')}
		<script src="./script/webOSTV.js" charset="utf-8"></script>
	</head>
	<body class="webos">
		<div id="root">${p.body || ''}</div>
		<script>if (!window.Intl) {document.write('<scr'+'ipt src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.${p.locales.join(
			`,Intl.~locale.`
		)}"></sc'+'ript>');}</script>
		${(p.bodyScripts || []).join('\n')}
	</body>
</html>`;

module.exports = exports = function compile(config) {
	let params = config.htmlWebpackPlugin.options;
	params.bodyScripts = utils.getManifestScripts(config.compilation.assets);
	return template(params);
};

exports.template = template;
