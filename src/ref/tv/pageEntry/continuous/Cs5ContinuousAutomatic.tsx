import * as React from 'react';
import ContinuousScrollList, { ContinuousScrollListProps } from './ContinuousScrollList';
import { getImageTypeForItemList } from 'shared/util/images';
import sass from 'ref/tv/util/sass';
import { Cs5ContinuousAutomatic as template } from 'shared/page/pageEntryTemplate';

export default function Cs5ContinuousAutomatic(props: ContinuousScrollListProps) {
	// persist evaluated imageType in the page metadata to enforce it across filtering changes
	let imageType: image.Type = props.customFields && props.customFields.imageType;
	if (!imageType) {
		imageType = getImageTypeForItemList(props.list);
		if (props.customFields) props.customFields.imageType = imageType;
	}

	return (
		<ContinuousScrollList
			{...props}
			imageType={imageType}
			imageWidth={getImageWidth(imageType)}
			itemsPerRow={getItemsPerRow(imageType)}
		/>
	);
}

Cs5ContinuousAutomatic.template = template;

function getImageWidth(imageType: image.Type) {
	switch (imageType) {
		case 'poster':
		case 'tall':
			return sass.posterImageWidth;
		case 'tile':
		case 'wallpaper':
			return sass.tileImageWidth;
		case 'block':
			return sass.blockImageWidth;
		case 'square':
		case 'logo':
			return sass.squareImageWidth;
		default:
			return sass.posterImageWidth;
	}
}

function getItemsPerRow(imageType: image.Type) {
	switch (imageType) {
		case 'poster':
		case 'tall':
			return 6;
		case 'tile':
		case 'wallpaper':
			return 5;
		case 'block':
			return 5;
		case 'square':
		case 'logo':
			return 6;
		default:
			return 6;
	}
}
