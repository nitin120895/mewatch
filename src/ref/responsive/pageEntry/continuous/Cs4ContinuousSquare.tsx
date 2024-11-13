import * as React from 'react';
import ContinuousScrollPackshotList, { ContinuousScrollPackshotListProps } from './ContinuousScrollPackshotList';
import { Cs4ContinuousSquare as template } from 'shared/page/pageEntryTemplate';

export const columns = [{ phone: 12 }, { phablet: 8 }, { tablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];

export default function Cs4ContinuousSquare(props: ContinuousScrollPackshotListProps) {
	return <ContinuousScrollPackshotList {...props} imageType="square" columns={columns} />;
}

Cs4ContinuousSquare.template = template;
