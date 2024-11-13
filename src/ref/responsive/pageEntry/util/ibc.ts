/**
 * IBC Transparency Hack (temporary):
 *
 * ISL (and thus Rocket) currently don't know if the source image uses transparency.
 * Rocket defaults all images to JPG for optimised runtime performance, however some components may want to leverage
 * transparency.
 * When the image type is 'custom' this will destructively alter the passed in options to force PNG.
 */
export function transparencyHack(imageType: image.Type, options: image.Options = {}): image.Options {
	if (imageType === 'custom') options.format = 'png';
	return options;
}
