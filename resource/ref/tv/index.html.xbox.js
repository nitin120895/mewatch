'use strict';

const utils = require('../../utils');

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
		<style type="text/css">
			@media (max-height: 1080px) {
				@-ms-viewport {
					width: 1920px;
					height: 1080px;
				}
			}
		</style>
		<script src="./script/xbox.js"></script>
	</head>
	<body class="xbox">
		<div id="root">${p.body || ''}</div>
		${(p.bodyScripts || []).join('\n')}
	</body>
</html>`;

module.exports = exports = function compile(config) {
	let params = config.htmlWebpackPlugin.options;
	params.bodyScripts = utils.getManifestScripts(config.compilation.assets);
	return template(params);
};

exports.template = template;
