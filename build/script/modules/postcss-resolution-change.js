const postcss = require('postcss');

function replaceResolution(match) {
	const nvalue = Math.round(parseInt(match) * 0.666667);
	return nvalue + 'px';
}

module.exports = postcss.plugin('postcss-resolution-change', function(options) {
	const r = /([0-9]*\.?[0-9]+)px/g;
	return function(root) {
		root.walkDecls(function(decl) {
			const px = decl.value.replace(r, replaceResolution);
			decl.value = px;
		});
	};
});
