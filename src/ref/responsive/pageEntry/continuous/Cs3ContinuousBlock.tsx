import * as React from 'react';
import ContinuousScrollPackshotList, { ContinuousScrollPackshotListProps } from './ContinuousScrollPackshotList';
import { Cs3ContinuousBlock as template } from 'shared/page/pageEntryTemplate';

export const columns = [{ phone: 24 }, { phablet: 12 }, { tablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

export default function Cs3ContinuousBlock(props: ContinuousScrollPackshotListProps) {
	return <ContinuousScrollPackshotList {...props} imageType="block" columns={columns} />;
}

Cs3ContinuousBlock.template = template;
