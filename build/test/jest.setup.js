// Require all env variables before executing the main server run script
require('dotenv').config();

// Set default env vars
const env = process.env;
if (!env.CLIENT_DEFAULT_LOCALE) env.CLIENT_DEFAULT_LOCALE = 'en';
if (!env.CLIENT_LOCALES) env.CLIENT_LOCALES = env.CLIENT_DEFAULT_LOCALE;
if (!env.CLIENT_SERVICE_CDN_URL) env.CLIENT_SERVICE_CDN_URL = env.CLIENT_SERVICE_URL;

require('core-js/fn/object/values');
require('../webpack/vendor/shims-dom');
