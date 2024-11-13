const path = require('path');

const env = process.env;
const isTV = env.TV === 'true';
const BRAND_NAME = 'toggle';
const RESOURCES_BASE = `./resource/${BRAND_NAME}`;
const RESOURCES_BASE_TV = `${RESOURCES_BASE}/tv`;

module.exports = {
	brandName: BRAND_NAME,
	resources: isTV
		? {
				webBase: RESOURCES_BASE,
				base: RESOURCES_BASE_TV,
				stringsBase: path.join(RESOURCES_BASE_TV, 'string'),
				favicon: path.join(RESOURCES_BASE_TV, 'image/favicon.png'),
				font: path.join(RESOURCES_BASE_TV, 'font')
		  }
		: {
				base: RESOURCES_BASE,
				stringsBase: path.join(RESOURCES_BASE, 'string'),
				favicon: path.join(RESOURCES_BASE, 'image/favicon.png'),
				font: path.join(RESOURCES_BASE, 'font')
		  }
};
