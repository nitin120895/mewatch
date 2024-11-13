import * as React from 'react';
import sass from 'ref/tv/util/sass';
import ContinuousScrollList, { ContinuousScrollListProps } from './ContinuousScrollList';
import { Cs2ContinuousTile as template } from 'shared/page/pageEntryTemplate';

export default function Cs2ContinuousTile(props: ContinuousScrollListProps) {
	return <ContinuousScrollList {...props} imageType="tile" imageWidth={sass.tileImageWidth} itemsPerRow={5} />;
}

Cs2ContinuousTile.template = template;
