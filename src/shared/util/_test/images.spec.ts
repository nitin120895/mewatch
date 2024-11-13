import { expect } from 'chai';
import * as util from '../images';

// Mock Data
const endpoint = 'https://domain.com/isl/api/v1/dataservice/ResizeImage/';
const defaultRegularQuality = util.imageQuality.get(1);
const defaultImageQuality = cleanQuality(defaultRegularQuality);
const resizeActionQuery = `&ResizeAction='fill'&HorizontalAlignment='center'&VerticalAlignment='top'`;
const images: any = {
	poster: `${endpoint}$value?Format='jpg'&Quality=${defaultImageQuality}&ImageId='128856'&EntityType='Item'&EntityId='81245'&Width=1400&Height=2100`,
	tile: `${endpoint}$value?Format='jpg'&Quality=${defaultImageQuality}&ImageId='128859'&EntityType='Item'&EntityId='81245'&Width=1024&Height=576`,
	wallpaper: `${endpoint}$value?Format='jpg'&Quality=${defaultImageQuality}&ImageId='128861'&EntityType='Item'&EntityId='81245'&Width=1920&Height=1080`,
	brand: `${endpoint}$value?Format='jpg'&Quality=${defaultImageQuality}&ImageId='128861'&EntityType='Item'&EntityId='81245'&Width=1920&Height=1080`,
	custom: `${endpoint}$value?Format='jpg'&Quality=${defaultImageQuality}&ImageId='128861'&EntityType='Item'&EntityId='81245'` // deliberately missing dimensions
};

function cleanQuality(quality: number): number {
	// The ResizeImage endpoint only supports whole numbers between 0-100 so we need to convert the float.
	return Math.ceil(quality * 100);
}

// Returns the URL with the new dimensions instead of the original dimensions
function getImageAtDimensions(url: string, width: number, height: number): string {
	let i = url.indexOf('Width=');
	let j = url.indexOf('&Height=');
	return (
		url.replace(url.substring(i, j), `Width=${width}`).replace(url.substr(++j), `Height=${height}`) + resizeActionQuery
	);
}

// Returns the URL with the expected quality level for the provided DRP.
function updateImageWithQuality(url: string, dpr: number, quality = NaN): string {
	const q = isNaN(quality) ? util.imageQuality.get(dpr) : quality;
	return url.replace(`Quality=${defaultImageQuality}`, `Quality=${cleanQuality(q)}`);
}

// Common Expectation Data
const posterResponse = {
	src: getImageAtDimensions(images.poster, 200, 300),
	width: 200,
	height: 300,
	pixelRatio: 1,
	type: 'poster',
	resolved: true
};

process.env.CLIENT_IMAGE_SIZE_MULTIPLIER = 1;

// Tests
describe('images', () => {
	// URL Resolution
	describe('resolveImage(s)', () => {
		const fallbackResponse = {
			src: util.fallbackURI,
			width: 0,
			height: 0,
			pixelRatio: 1,
			type: 'poster',
			resolved: false
		};

		it('should return fallback when no dimensions are provided', () => {
			expect(util.resolveImage(images, 'poster', {})).to.deep.equal(fallbackResponse);
		});
		it("should return fallback when the image type isn't available", () => {
			expect(util.resolveImage(images, 'hero4x3', { width: 400, height: 300 })).to.deep.equal({
				src: util.fallbackURI,
				width: 400,
				height: 300,
				pixelRatio: 1,
				type: 'hero4x3',
				resolved: false
			});
		});
		it('should return fallback when the dimensions are invalid', () => {
			expect(util.resolveImage(images, 'poster', { width: -1 })).to.deep.equal(fallbackResponse);
			expect(util.resolveImage(images, 'poster', { height: -1 })).to.deep.equal(fallbackResponse);
		});
		it('should return fallback when the image type is invalid', () => {
			const imageType: any = 'invalid';
			expect(util.resolveImage(images, imageType, { width: 200 })).to.deep.equal({
				src: util.fallbackURI,
				width: 200,
				height: 200,
				pixelRatio: 1,
				type: imageType,
				resolved: false
			});
		});
		it('should maintain aspect ratio when a single dimension is provided', () => {
			expect(util.resolveImage(images, 'poster', { width: 200 })).to.deep.equal(posterResponse);
			expect(util.resolveImage(images, 'poster', { height: 300 })).to.deep.equal(posterResponse);
		});
		it('should maintain aspect ratio when a single dimension is invalid', () => {
			expect(util.resolveImage(images, 'poster', { width: 200, height: 0 })).to.deep.equal(posterResponse);
			expect(util.resolveImage(images, 'poster', { width: -1, height: 300 })).to.deep.equal(posterResponse);
		});
		it("should apply resize action only if provided dimensions don't match original aspect ratio", () => {
			const tileResponse = {
				src: getImageAtDimensions(images.tile, 400, 300),
				width: 400,
				height: 300,
				pixelRatio: 1,
				type: 'tile',
				resolved: true
			};
			expect(util.resolveImage(images, 'tile', { width: 400, height: 300 })).to.deep.equal(tileResponse);
			expect(util.resolveImage(images, 'poster', { width: 200, height: 300 })).to.deep.equal(posterResponse);
		});
		it('should resolve first matching image type', () => {
			const tileResponse = {
				src: getImageAtDimensions(images.tile, 640, 360),
				width: 640,
				height: 360,
				pixelRatio: 1,
				type: 'tile',
				resolved: true
			};
			expect(util.resolveImage(images, 'tile', { width: 640 })).to.deep.equal(tileResponse);
			expect(util.resolveImage(images, ['hero4x3', 'tile', 'poster'], { width: 640 })).to.deep.equal(tileResponse);
		});
		it('should prevent upscaling', () => {
			const tileResponse = {
				src: images.tile + resizeActionQuery,
				width: 1024,
				height: 576,
				pixelRatio: 1,
				type: 'tile',
				resolved: true
			};
			const tileResponse2 = Object.assign({}, tileResponse, {
				width: 576,
				src: getImageAtDimensions(images.tile, 576, 576)
			});
			expect(util.resolveImage(images, 'tile', { width: 1920, height: 1080 })).to.deep.equal(tileResponse);
			expect(util.resolveImage(images, 'tile', { width: 1920 })).to.deep.equal(tileResponse);
			expect(util.resolveImage(images, 'tile', { height: 1080 })).to.deep.equal(tileResponse);
			expect(util.resolveImage(images, 'tile', { width: 600, height: 600 })).to.deep.equal(tileResponse2);
		});
		it("should use provided dimensions if the image url doesn't have source dimensions", () => {
			const width = 360;
			const customResponse = {
				src: `${images.custom}${resizeActionQuery}&Width=${width}&Height=${width}`,
				width,
				height: width,
				pixelRatio: 1,
				type: 'custom',
				resolved: true
			};
			expect(util.resolveImage(images, 'custom', { width })).to.deep.equal(customResponse);
		});
		it("should infer aspect ratio from source dimensions when it's unknown from the image type", () => {
			const brandResponse = {
				src: getImageAtDimensions(images.brand, 640, 360),
				width: 640,
				height: 360,
				pixelRatio: 1,
				type: 'brand',
				resolved: true
			};
			expect(util.resolveImage(images, 'brand', { width: 640 })).to.deep.equal(brandResponse);
		});
		it('should use default quality values for supported pixel density ratios when no quality value was provided', () => {
			const tileResponse = [
				{
					src: getImageAtDimensions(images.tile, 480, 270),
					width: 480,
					height: 270,
					pixelRatio: 1,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(getImageAtDimensions(images.tile, 960, 540), 2),
					width: 960,
					height: 540,
					pixelRatio: 2,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(images.tile + resizeActionQuery, 3),
					width: 1024,
					height: 576,
					pixelRatio: 3,
					type: 'tile',
					resolved: true
				}
			];
			const { width, height } = tileResponse[0];
			expect(util.resolveImages(images, 'tile', { width, height }, [1, 2, 3])).to.deep.equal(tileResponse);
		});
		it('should reduce quality as pixel density ratio increases when provided with a quality value', () => {
			const quality = 0.85;
			const tileResponse = [
				{
					src: updateImageWithQuality(getImageAtDimensions(images.tile, 480, 270), 1, quality / 1),
					width: 480,
					height: 270,
					pixelRatio: 1,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(getImageAtDimensions(images.tile, 960, 540), 2, quality / 2),
					width: 960,
					height: 540,
					pixelRatio: 2,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(images.tile + resizeActionQuery, 3, quality / 3),
					width: 1024,
					height: 576,
					pixelRatio: 3,
					type: 'tile',
					resolved: true
				}
			];
			const { width, height } = tileResponse[0];
			expect(util.resolveImages(images, 'tile', { width, height, quality }, [1, 2, 3])).to.deep.equal(tileResponse);
		});
		it('should constrain quality between 0 and 1 values (1-100%)', () => {
			const response = Object.assign({}, posterResponse, {
				src: updateImageWithQuality(posterResponse.src, 1, 0.01)
			});
			expect(util.resolveImage(images, 'poster', { width: 200, quality: -1 })).to.deep.equal(response);
			response.src = updateImageWithQuality(posterResponse.src, 1, 1);
			expect(util.resolveImage(images, 'poster', { width: 200, quality: 2 })).to.deep.equal(response);
		});
		it('should not resolve duplicates based on upscaling', () => {
			const tileResponse = [
				{
					src: getImageAtDimensions(images.tile, 480, 270),
					width: 480,
					height: 270,
					pixelRatio: 1,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(getImageAtDimensions(images.tile, 960, 540), 2),
					width: 960,
					height: 540,
					pixelRatio: 2,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(images.tile + resizeActionQuery, 3),
					width: 1024,
					height: 576,
					pixelRatio: 3,
					type: 'tile',
					resolved: true
				}
			];
			const { width, height } = tileResponse[0];
			expect(util.resolveImages(images, 'tile', { width, height }, [1, 2, 3, 4, 5])).to.deep.equal(tileResponse);
		});
		it('should not resolve duplicates based on pixel ratio', () => {
			const tileResponse = [
				{
					src: getImageAtDimensions(images.tile, 512, 288),
					width: 512,
					height: 288,
					pixelRatio: 1,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(images.tile + resizeActionQuery, 2),
					width: 1024,
					height: 576,
					pixelRatio: 2,
					type: 'tile',
					resolved: true
				}
			];
			const { width, height } = tileResponse[0];
			expect(util.resolveImages(images, 'tile', { width, height }, [1, 2, 2])).to.deep.equal(tileResponse);
		});
		it('should sort based on lowest pixel ratio to highest', () => {
			const tileResponse = [
				{
					src: getImageAtDimensions(images.tile, 512, 288),
					width: 512,
					height: 288,
					pixelRatio: 1,
					type: 'tile',
					resolved: true
				},
				{
					src: updateImageWithQuality(images.tile + resizeActionQuery, 2),
					width: 1024,
					height: 576,
					pixelRatio: 2,
					type: 'tile',
					resolved: true
				}
			];
			const { width, height } = tileResponse[0];
			expect(util.resolveImages(images, 'tile', { width, height }, [2, 1])).to.deep.equal(tileResponse);
		});
	});

	// Responsive Images
	describe('SrcSet', () => {
		it('should return SrcSet', () => {
			const source = util.resolveImage(images, 'poster', { width: 200 });
			expect(util.convertResourceToSrcSet(source, true)).to.deep.equal({
				url: posterResponse.src,
				pixelRatio: 1
			});
			expect(util.convertResourceToSrcSet(source, false)).to.deep.equal({
				url: posterResponse.src,
				width: 200
			});
		});
		it('should flatten a SrcSet array into a string', () => {
			const img = 'path/to/image.jpg';
			const srcSetsDPR = [
				{ url: `${img.replace('.', '@1X.')}`, pixelRatio: 1 },
				{ url: `${img.replace('.', '@2X.')}`, pixelRatio: 2 }
			];
			expect(util.flattenSrcSet(srcSetsDPR)).to.deep.equal('path/to/image@1X.jpg 1x, path/to/image@2X.jpg 2x');
			const srcSetsWidth = [
				{ url: `${img.replace('.', '_200.')}`, width: 200 },
				{ url: `${img.replace('.', '_400.')}`, width: 400 }
			];
			expect(util.flattenSrcSet(srcSetsWidth)).to.deep.equal('path/to/image_200.jpg 200w, path/to/image_400.jpg 400w');
		});
	});

	// Max Width and Height calculation
	describe('getMaxWidthAndHeight', () => {
		const queryParams = {
			Width: 400,
			Height: 200
		};
		const aspectRatio = 2;

		it('should preserve aspect ratio and calculate a maxHeight when given a maxWidth', () => {
			const getMax = util.getMaxWidthAndHeight(queryParams, aspectRatio, {
				maxWidth: 300
			});
			expect(getMax.maxWidth).to.equal(300);
			expect(getMax.maxHeight).to.equal(150);
		});

		it('should preserve aspect ratio and calculate a maxWidth when given a maxHeight', () => {
			const getMax = util.getMaxWidthAndHeight(queryParams, aspectRatio, {
				maxHeight: 150
			});
			expect(getMax.maxHeight).to.equal(150);
			expect(getMax.maxWidth).to.equal(300);
		});

		it('should preserve aspect ratio and use the smaller dimension when both maxHeight and maxWidth are specified', () => {
			let getMax = util.getMaxWidthAndHeight(queryParams, aspectRatio, {
				maxWidth: 300,
				maxHeight: 250
			});
			expect(getMax.maxWidth).to.equal(300);
			expect(getMax.maxHeight).to.equal(150);
			getMax = util.getMaxWidthAndHeight(queryParams, aspectRatio, {
				maxWidth: 350,
				maxHeight: 150
			});
			expect(getMax.maxHeight).to.equal(150);
			expect(getMax.maxWidth).to.equal(300);
		});

		it('should use source dimensions over specified maxWidth if source dimensions are smaller', () => {
			const getMax = util.getMaxWidthAndHeight(queryParams, aspectRatio, {
				maxWidth: 500
			});
			expect(getMax.maxWidth).to.equal(400);
			expect(getMax.maxHeight).to.equal(200);
		});

		it('should use source dimensions over specified maxHeight if source dimensions are smaller', () => {
			const getMax = util.getMaxWidthAndHeight(queryParams, aspectRatio, {
				maxHeight: 250
			});
			expect(getMax.maxWidth).to.equal(400);
			expect(getMax.maxHeight).to.equal(200);
		});

		it('should use source dimensions over specified maxWidth and maxHeight if source dimensions are smaller', () => {
			const getMax = util.getMaxWidthAndHeight(queryParams, aspectRatio, {
				maxWidth: 500,
				maxHeight: 250
			});
			expect(getMax.maxWidth).to.equal(400);
			expect(getMax.maxHeight).to.equal(200);
		});
	});

	describe('Image Size Multiplier', () => {
		it('must increase the width and height of the requested image based on the size of the multiplier for images with a pixel ratio of 1', () => {
			const multipliers = [2, 1.4];
			multipliers.forEach(multiplier => {
				process.env.CLIENT_IMAGE_SIZE_MULTIPLIER = multiplier;
				const width = 100;
				const height = 200;

				const imageSet = util.resolveImages(images, 'tile', { width, height }, [1]);
				const image = imageSet.pop();
				const [, widthGroup] = image.src.match(/Width=(\d+)&/);
				const [, heightGroup] = image.src.match(/Height=(\d+)&/);
				expect(widthGroup).to.equal(String(width * multiplier));
				expect(heightGroup).to.equal(String(height * multiplier));
			});
		});

		it('must not increase the width and height of the requested image based on the size of the multiplier for images with a pixel ratio greater than 1', () => {
			process.env.CLIENT_IMAGE_SIZE_MULTIPLIER = 2;
			const imageSet = util.resolveImages(images, 'tile', { width: 100, height: 200 }, [2]);

			const image = imageSet.pop();
			const [, widthGroup] = image.src.match(/Width=(\d+)&/);
			const [, heightGroup] = image.src.match(/Height=(\d+)&/);
			expect(widthGroup).to.equal('200');
			expect(heightGroup).to.equal('400');
		});

		it('must behave normally if the CLIENT_IMAGE_SIZE_MULTIPLIER is not present', () => {
			process.env.CLIENT_IMAGE_SIZE_MULTIPLIER = undefined;
			const width = 100;
			const height = 200;

			const imageSet = util.resolveImages(images, 'tile', { width, height }, [1]);
			const image = imageSet.pop();
			const [, widthGroup] = image.src.match(/Width=(\d+)&/);
			const [, heightGroup] = image.src.match(/Height=(\d+)&/);
			expect(widthGroup).to.equal(String(width));
			expect(heightGroup).to.equal(String(height));
		});

		it('must not accept CLIENT_IMAGE_SIZE_MULTIPLIERS less than 1', () => {
			process.env.CLIENT_IMAGE_SIZE_MULTIPLIER = 0.5;
			const width = 100;
			const height = 200;

			const imageSet = util.resolveImages(images, 'tile', { width, height }, [1]);
			const image = imageSet.pop();
			const [, widthGroup] = image.src.match(/Width=(\d+)&/);
			const [, heightGroup] = image.src.match(/Height=(\d+)&/);
			expect(widthGroup).to.equal(String(width));
			expect(heightGroup).to.equal(String(height));
		});
	});
});
