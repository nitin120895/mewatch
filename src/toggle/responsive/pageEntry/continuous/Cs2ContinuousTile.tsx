import * as React from 'react';
import ContinuousScrollPackshotList, { ContinuousScrollPackshotListProps } from './ContinuousScrollPackshotList';
import { Cs2ContinuousTile as template } from 'shared/page/pageEntryTemplate';

export const columns = [{ phone: 12 }, { phablet: 12 }, { tablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

export default function Cs2ContinuousTile(props: ContinuousScrollPackshotListProps) {
	return <ContinuousScrollPackshotList {...props} imageType="tile" columns={columns} />;
}

Cs2ContinuousTile.template = template;
