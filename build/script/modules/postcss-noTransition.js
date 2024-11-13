const postcss = require('postcss');

module.exports = postcss.plugin('postcss-no-transition', function(options) {
	return function(root) {
		root.walkDecls(/transition/, function(decl) {
			decl.remove();
		});
	};
});
