import * as React from 'react';
import { Bem } from 'shared/util/styles';
import {
	generateGoogleCalendarUrl,
	generateIcsCalendarFile
} from 'toggle/responsive/component/AddToCalendarButton/utils';
import { queryStringToObject } from 'toggle/responsive/util/urlUtil';
import BrandLogo from 'ref/responsive/component/AxisLogo';

import './DownloadICS.scss';

export const DOWNLOAD_ICS_PAGE_PATH = 'download-ics';

const bem = new Bem('download-ics');

const DownloadICS = ({ location }) => {
	let hash = location.hash;
	if (hash) {
		hash = hash.split('?')[0];
		const hashObj: any = queryStringToObject(hash);
		const isGoogleCal = hashObj.google === 'true';
		window.location.href = isGoogleCal ? generateGoogleCalendarUrl(hashObj) : generateIcsCalendarFile(hashObj);
	}

	return (
		<div className={bem.b()}>
			<BrandLogo className={bem.e('logo')} />
		</div>
	);
};

export default DownloadICS;
