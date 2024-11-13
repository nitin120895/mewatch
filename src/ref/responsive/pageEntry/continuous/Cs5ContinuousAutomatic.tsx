import * as React from 'react';
import ContinuousScrollPackshotList, { ContinuousScrollPackshotListProps } from './ContinuousScrollPackshotList';
import { getImageTypeForItemList } from 'shared/util/images';
import { columns as PosterColumns } from './Cs1ContinuousPoster';
import { columns as TileColumns } from './Cs2ContinuousTile';
import { columns as BlockColumns } from './Cs3ContinuousBlock';
import { columns as SquareColumns } from './Cs4ContinuousSquare';
import { Cs5ContinuousAutomatic as template } from 'shared/page/pageEntryTemplate';

export default function Cs5ContinuousAutomatic(props: ContinuousScrollPackshotListProps) {
	if (!props.list) return <div />;
	const imageType = getImageTypeForItemList(props.list);
	return <ContinuousScrollPackshotList {...props} imageType={imageType} columns={getColumns(imageType)} />;
}

function getColumns(imageType: image.Type) {
	switch (imageType) {
		case 'poster':
			return PosterColumns;
		case 'tile':
			return TileColumns;
		case 'block':
			return BlockColumns;
		case 'square':
			return SquareColumns;
		default:
			return PosterColumns;
	}
}

Cs5ContinuousAutomatic.template = template;
