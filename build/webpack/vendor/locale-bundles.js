// Export all required locale data modules for bundling, based on process.env variables.
// These are used to compliment your provided strings.json files and contain the rules
// for pluralisations, dates, currency, etc.
// https://github.com/yahoo/react-intl/wiki#loading-locale-data
module.exports = [
	...new Set(
		(process.env.CLIENT_LOCALES || process.env.CLIENT_DEFAULT_LOCALE)
			.split(',')
			.map(localeCode => `react-intl/locale-data/${localeCode.split('-').shift()}`)
	)
];
