// Locale data modules loader, patches modules for CommonJs to expose ReactIntlLocaleData global variable
module.exports = function(source) {
	return source.replace(/"object".+define\(.\)\:/, '').replace('this', 'window');
};
