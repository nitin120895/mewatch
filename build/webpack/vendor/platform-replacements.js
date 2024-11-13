'use strict';

// Mapping should follow `tsconfig.json` paths mapping

const refDeviceModel = 'shared/util/platforms/deviceModel';
const refKeysModel = 'shared/util/platforms/keysModel';
const refPlayerTV = 'ref/tv/pageEntry/player/playerCore/web/HtmlPlayer';
const refPageScrollTV = 'ref/tv/util/PageScroll';

const mappingsWeb = {
	[refDeviceModel]: ['shared/util/platforms/web/webDeviceModel'],
	[refKeysModel]: ['shared/util/platforms/web/webKeysModel']
};

const mappingsTV =
	process.env.NO_CSS_TRANSITION === 'true'
		? {
				[refDeviceModel]: ['shared/util/platforms/tv/tvDeviceModel'],
				[refKeysModel]: ['shared/util/platforms/tv/tvKeysModel'],
				[refPageScrollTV]: ['ref/tv/util/PageScroll-offsetTop']
		  }
		: {
				[refDeviceModel]: ['shared/util/platforms/tv/tvDeviceModel'],
				[refKeysModel]: ['shared/util/platforms/tv/tvKeysModel']
		  };

const mappingsTizen = {
	[refDeviceModel]: ['shared/util/platforms/tizen/tizenDeviceModel'],
	[refKeysModel]: ['shared/util/platforms/tizen/tizenKeysModel'],
	[refPlayerTV]: ['ref/tv/pageEntry/player/playerCore/tizen/HtmlPlayer'],
	[refPageScrollTV]: ['ref/tv/util/PageScroll-offsetTop']
};

const mappingsWebOS = {
	[refDeviceModel]: ['shared/util/platforms/webos/lgDeviceModel'],
	[refKeysModel]: ['shared/util/platforms/webos/lgKeysModel'],
	[refPlayerTV]: ['ref/tv/pageEntry/player/playerCore/webos/HtmlPlayer'],
	[refPageScrollTV]: ['ref/tv/util/PageScroll-offsetTop']
};

const mappingsXBox = {
	[refDeviceModel]: ['shared/util/platforms/xbox/xbDeviceModel'],
	[refKeysModel]: ['shared/util/platforms/xbox/xbKeysModel'],
	[refPlayerTV]: ['ref/tv/pageEntry/player/playerCore/xbox/HtmlPlayer'],
	[refPageScrollTV]: ['ref/tv/util/PageScroll-offsetTop']
};

module.exports = function(platform) {
	switch (platform) {
		case 'tv_samsung':
			return mappingsTizen;
		case 'tv_lg_webos':
			return mappingsWebOS;
		case 'tv_xboxone':
			return mappingsXBox;
		case 'tv_generic':
			return mappingsTV;
		default:
			return mappingsWeb;
	}
};
