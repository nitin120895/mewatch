import { getImageTypeForItem } from 'shared/util/images';

export function getEpisodeDetailImageTypes(episode: api.ItemSummary): image.Type[] {
	// For episodes we allow both 'tile' and 'wallpaper' image types (when sticking to 16:9) to
	// allow customers to leverage both if they wish to differentiate branded imagery from their
	// video still frame images.
	// This allows different imagery to be used when episodes are scheduled within lists on other
	// pages, compared to the expected still frame images used on the item detail page.
	const imageType = getImageTypeForItem(episode);
	const imageTypes: image.Type[] = [];
	// In this case we choose to inject this alternate type before the default to ensure we use
	// the still frame (if available).
	if (imageType === 'tile') imageTypes.push('wallpaper');
	else if (imageType === 'wallpaper') imageTypes.push('tile');
	imageTypes.push(imageType);

	return imageTypes;
}
