import * as React from 'react';
import sass from 'ref/tv/util/sass';
import ContinuousScrollList, { ContinuousScrollListProps } from './ContinuousScrollList';
import { Cs4ContinuousSquare as template } from 'shared/page/pageEntryTemplate';

export default function Cs4ContinuousSquare(props: ContinuousScrollListProps) {
	return <ContinuousScrollList {...props} imageType="square" imageWidth={sass.squareImageWidth} itemsPerRow={6} />;
}

Cs4ContinuousSquare.template = template;
