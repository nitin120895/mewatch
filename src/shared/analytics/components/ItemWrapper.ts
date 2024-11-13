import {
	analyticsComponentWrapper,
	WrappedComponentContext
} from 'shared/analytics/components/AnalyticsDomEventWrapper';
import { getDomEventDataEntry, getImageData, getImageIdFromUrL } from 'shared/analytics/getContext';
import { CTATypes, DomEventSourceType, EventName } from 'shared/analytics/types/types';
import { Image } from 'shared/analytics/types/v3/context/entry';
import { CH2, CHD2, Epg3, XEPG5, XEPG6 } from 'shared/page/pageEntryTemplate';

export interface ItemWrapperProps {
	item: api.ItemSummary;
	image: Image;
	imageType?: keyof api.ItemSummary['images'];
	index: number;
	sources?: Array<image.Source & { imageType }>;
	schedule?: api.ItemSchedule;
	channel?: api.ItemSummary;
	currentProgram?: api.ItemSummary;
	listData?: api.ListData;
	totalScheduleCount?: number;
	totalCastCount?: number;
	edit?: boolean;
}

export const getEntryDataFromContext = (context, event) => {
	if (typeof context.getContextEntryData === 'function') {
		return context.getContextEntryData(event).entry;
	} else {
		return getDomEventDataEntry(context.entry);
	}
};

const getLinearItemData = (item: api.ItemSummary, currentProgram: api.ItemSummary, channel: api.ItemSummary, entry) => {
	switch (entry.template) {
		case CH2:
		case CHD2:
		case Epg3:
			return { ...channel, scheduleItem: { ...item } };

		case XEPG5:
		case XEPG6:
			return { ...item, scheduleItem: { ...currentProgram } };

		default:
			return item;
	}
};

const events = [EventName.CLICK, EventName.MOUSEENTER, EventName.MOUSELEAVE, EventName.ERROR];

const getComponentCurrentImage = (selector, images: Array<{ type; url; id }>, event) => {
	const imageElement = (<HTMLMediaElement>event.currentTarget).querySelector(selector);
	const imageUrl = imageElement && decodeURIComponent(imageElement.currentSrc || imageElement.src || '');
	const imageId = imageElement && getImageIdFromUrL(imageUrl);
	return (imageId && images.find(({ id }) => id === imageId)) || images[0];
};

const getCarouselItemData = <P extends ItemWrapperProps>({ item, index, sources }: P) => (
	context: WrappedComponentContext,
	event: Event
) => {
	const images = sources.map(({ src, imageType }) => ({ url: src, type: imageType, id: getImageIdFromUrL(src) }));
	const image = getComponentCurrentImage('.carousel-item__image', images, event);
	const entry = getEntryDataFromContext(context, event);
	return { entry, item, index, image };
};

const getPackshotData = <P extends ItemWrapperProps>({ item, edit, listData, index = 0, totalCastCount }: P) => (
	context: WrappedComponentContext,
	event
) => {
	let images = Object.entries(item.images || []).map(([type, url]) => ({ type, url, id: getImageIdFromUrL(url) }));
	const image = getComponentCurrentImage('.carousel-item__image', images, event);
	const entry = getEntryDataFromContext(context, event);
	return { entry, item, index, image, edit, listData, totalCastCount };
};

const getMosaicData = <P extends ItemWrapperProps>({ item, index }: P) => (context: WrappedComponentContext, event) => {
	const entry = getEntryDataFromContext(context, event);
	const image = getImageData(item, 'wallpaper');
	return { entry, item, index, image };
};

const getItemPlayButtonData = <P extends ItemWrapperProps>({ episode }: P & { episode: api.ItemSummary }) => (
	context: WrappedComponentContext,
	event
) => {
	const entry = getEntryDataFromContext(context, event);
	const image = { type: 'inline-svg', url: 'EpisodePlayIcon.tsx', id: '' };
	return { entry, item: episode, index: 0, image };
};

const getLinearData = <P extends ItemWrapperProps>({
	item,
	channel,
	currentProgram,
	index = 0,
	totalScheduleCount
}: P) => (context: WrappedComponentContext, event) => {
	let image = undefined;
	const entry = getEntryDataFromContext(context, event);
	const itemData = getLinearItemData(item, currentProgram, channel, entry);

	if (item) {
		const images = Object.entries(item.images || []).map(([type, url]) => ({ type, url, id: getImageIdFromUrL(url) }));
		image = getComponentCurrentImage('.carousel-item__image', images, event);
	}
	return { entry, item: itemData, totalScheduleCount, index, image };
};

const getReminderCtaData = props => {
	const { scheduleItem, entryPoint } = props;
	const updatedItem = {
		...scheduleItem.item,
		scheduleItem
	};
	return () => ({ type: CTATypes.SetReminder, data: { item: updatedItem, entryPoint } });
};

const getWatchCtaData = props => {
	const { item, currentProgram, schedule } = props;
	const updatedItem = {
		...item,
		scheduleItem: currentProgram || schedule
	};
	return () => ({ type: CTATypes.Watch, data: { item: updatedItem } });
};

export const wrapCarousel = analyticsComponentWrapper(events, getCarouselItemData, DomEventSourceType.Item);
export const wrapPackshot = analyticsComponentWrapper(events, getPackshotData, DomEventSourceType.Item);
export const wrapMosaic = analyticsComponentWrapper(events, getMosaicData, DomEventSourceType.Item);
export const wrapItemPlayButton = analyticsComponentWrapper(events, getItemPlayButtonData, DomEventSourceType.Item);
export const wrapLinear = analyticsComponentWrapper(events, getLinearData, DomEventSourceType.Item);
export const wrapReminderCta = analyticsComponentWrapper(events, getReminderCtaData, DomEventSourceType.CTA);
export const wrapWatchCta = analyticsComponentWrapper([EventName.CLICK], getWatchCtaData, DomEventSourceType.CTA);
