import * as React from 'react';
import sass from 'ref/tv/util/sass';
import ContinuousScrollList, { ContinuousScrollListProps } from './ContinuousScrollList';
import { Cs1ContinuousPoster as template } from 'shared/page/pageEntryTemplate';

export default function Cs1ContinuousPoster(props: ContinuousScrollListProps) {
	return <ContinuousScrollList {...props} imageType="poster" imageWidth={sass.posterImageWidth} itemsPerRow={6} />;
}

Cs1ContinuousPoster.template = template;
