import * as React from 'react';
import ContinuousScrollPackshotList, { ContinuousScrollPackshotListProps } from './ContinuousScrollPackshotList';
import { Cs1ContinuousPoster as template } from 'shared/page/pageEntryTemplate';

export const columns = [{ phone: 12 }, { phablet: 8 }, { tablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];

export default function Cs1ContinuousPoster(props: ContinuousScrollPackshotListProps) {
	return <ContinuousScrollPackshotList {...props} imageType="poster" columns={columns} />;
}

Cs1ContinuousPoster.template = template;
