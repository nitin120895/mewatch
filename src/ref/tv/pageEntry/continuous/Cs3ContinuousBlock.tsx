import * as React from 'react';
import sass from 'ref/tv/util/sass';
import ContinuousScrollList, { ContinuousScrollListProps } from './ContinuousScrollList';
import { Cs3ContinuousBlock as template } from 'shared/page/pageEntryTemplate';

export default function Cs3ContinuousBlock(props: ContinuousScrollListProps) {
	return <ContinuousScrollList {...props} imageType="block" imageWidth={sass.tileImageWidth} itemsPerRow={5} />;
}

Cs3ContinuousBlock.template = template;
