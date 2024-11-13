'use strict';

const utils = require('../../utils');
const spoofUA = 'Opera/9.80%20(Windows%20NT%206.0)%20Presto/2.12.388%20Version/12.14';

const template = p =>
	`<!DOCTYPE html>
<html lang="${p.lang}">
	<head>
		<meta http-equiv="Content-Type" content="text/html, charset=UTF-8">
		<meta charset="utf-8">
		<meta name="viewport" content="${p.viewport}">
		${utils.getMeta(p.meta).join('\n')}
		${(p.title || '').indexOf('<') === 0 ? p.title : `<title>${p.title}</title>`}
		${(p.styles || []).join('\n')}
		${(p.scripts || []).join('\n')}
		<script src='$WEBAPIS/webapis/webapis.js'></script>
	</head>
	<body class="tizen">
		<div id="root">${p.body || ''}</div>
		<script>if (!window.Intl) {
			document.write('<scr'+'ipt src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.${p.locales.join(
				`,Intl.~locale.`
			)}|always&ua=${spoofUA}"></sc'+'ript>');}</script>
		${(p.bodyScripts || []).join('\n')}
	</body>
</html>`;

module.exports = exports = function compile(config) {
	let params = config.htmlWebpackPlugin.options;
	params.bodyScripts = utils.getManifestScripts(config.compilation.assets);
	return template(params);
};

exports.template = template;
