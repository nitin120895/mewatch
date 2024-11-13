import * as PropTypes from 'prop-types';
import { createElement } from 'react';
import { findDOMNode } from 'react-dom';
import { CarouselProps } from 'ref/responsive/pageEntry/hero/common/Carousel';
import { IMPRESSION_TIME_SECS } from 'shared/analytics/config';
import {
	H9Image,
	Pb1Cover,
	Pb2Text,
	Pb3Background,
	Pb4Image,
	Sb1Cover,
	Sb2Text,
	Sb3Background,
	Sb4Image,
	Tb1Cover,
	Tb2Text,
	Tb3Background,
	Tb4Image,
	H5Thumbnails
} from 'shared/page/pageEntryTemplate';
import { debounce, defer, once } from 'shared/util/performance';
import { secondsToMs } from 'shared/util/time';
import { getDomEventDataEntry, getImageIdFromUrL } from '../getContext';
import { DomEventSourceType, EntryProps, EventName } from '../types/types';
import { AnalyticsDomEventWrapper, WrappedComponentContext } from './AnalyticsDomEventWrapper';

type ViewPortExtent = { start: number; end: number };
type ScrollManagerMember = { component: AnalyticsEntryWrapper<any>; midpoint?: number };

enum VerticalScrollDirection {
	Up = 'Up',
	Down = 'Down',
	Static = 'None'
}

interface IEntryScrollManager {
	// direction: VerticalScrollDirection;
	isSorted: boolean;
	members: Array<ScrollManagerMember>;
	scrollPosition: number;

	register(component: AnalyticsEntryWrapper<any>): void;
	unregister(component: AnalyticsEntryWrapper<any>): void;
	sort(): void;
	refresh(): void;
	handleScroll(): void;
}

const EVENTS = [EventName.HSCROLL, EventName.VIEWED];

interface IEntryImageDetails {
	imageQuery: string;
	images: Array<{ type: string; url: string; id: string }>;
}

type EntryEvent = Event & { currentTarget: HTMLElement };

const getComponentCurrentImage = ({ imageQuery, images }: IEntryImageDetails, entryDomComponent: HTMLElement) => {
	const imageElement: HTMLMediaElement = entryDomComponent.querySelector(imageQuery) as HTMLMediaElement;
	const imageUrl = imageElement && decodeURIComponent(imageElement.currentSrc || imageElement.src || '');
	const imageId = imageElement && getImageIdFromUrL(imageUrl);
	return (imageId && images.find(({ id }) => id === imageId)) || images[0];
};

const getEntryEventData = <P>(props: P, getImageDetails?: (props: P) => IEntryImageDetails) => (
	context: WrappedComponentContext,
	event: EntryEvent,
	component: AnalyticsEntryWrapper<P>
) => {
	let imageData = {};
	if (getImageDetails) {
		const imageDetails = getImageDetails(props);
		imageData = imageDetails
			? { image: getComponentCurrentImage(imageDetails, findDOMNode(component) || event.currentTarget) }
			: {};
	}

	return { entry: { ...getDomEventDataEntry(context.entry), ...imageData } };
};

const isVisible = ({ start, end }: ViewPortExtent, member: ScrollManagerMember): boolean => {
	return member.midpoint >= start && member.midpoint <= end;
};
const getVerticalScrollDirection = (oldPosition: number, newPosition: number): VerticalScrollDirection => {
	const { Up, Down, Static } = VerticalScrollDirection;
	return oldPosition === newPosition ? Static : newPosition > oldPosition ? Down : Up;
};

const getViewPortYExtent = (): ViewPortExtent => ({
	start: window.pageYOffset,
	end: window.pageYOffset + window.innerHeight
});

const EntryScrollManager: IEntryScrollManager = {
	scrollPosition: 0,
	isSorted: false,
	members: [],

	sort(this: IEntryScrollManager) {
		if (this.isSorted) {
			return;
		}
		this.members.sort((a, b) => a.midpoint - b.midpoint);
		this.isSorted = true;
	},

	register(this: IEntryScrollManager, component) {
		this.isSorted = false;
		this.members.push({ component, midpoint: component.getMidpointY() });
	},

	unregister(this: IEntryScrollManager, targetComponent) {
		this.isSorted = false;
		this.members = this.members.filter(({ component }) => targetComponent !== component);
	},

	refresh(this: IEntryScrollManager) {
		this.members.forEach(member => {
			member.midpoint = member.component.getMidpointY();
		});
		this.sort();
		EntryScrollManager.handleScroll();
	},

	handleScroll(this: IEntryScrollManager) {
		const viewport = getViewPortYExtent();
		const direction = getVerticalScrollDirection(this.scrollPosition, window.pageYOffset);
		this.scrollPosition = window.pageYOffset;
		const members = this.members.slice(0);
		direction === VerticalScrollDirection.Up && members.reverse();
		members.reduce((state, member) => {
			if (state !== 'missed' && isVisible(viewport, member)) {
				member.component.emitVisibilityEvent(true);
				return 'found';
			} else {
				member.component.emitVisibilityEvent(false);
				return state === 'found' ? 'missed' : state;
			}
		}, 'init');
	}
};

const refreshScrollManagerOnce = once(() => EntryScrollManager.refresh());
const refreshScrollManagerDebounced = debounce(() => EntryScrollManager.refresh(), 100);

class AnalyticsEntryWrapper<P> extends AnalyticsDomEventWrapper<P> {
	private isVisible = false;
	private isViewed = false;

	static childContextTypes = {
		getContextEntryData: PropTypes.func
	};

	getMidpointY() {
		const domNode = findDOMNode<any>(this);
		if (!domNode) {
			return -1;
		}
		const rect = domNode.getBoundingClientRect();
		const { top, height } = rect;
		return Math.floor(top + window.pageYOffset + height / 2);
	}

	componentDidMount() {
		AnalyticsDomEventWrapper.prototype.componentDidMount.apply(this);
		const domNode = findDOMNode<any>(this);
		defer(refreshScrollManagerOnce);
		return domNode && EntryScrollManager.register(this);
	}

	componentWillUnmount() {
		EntryScrollManager.unregister(this);
	}

	emitVisibilityEvent(isVisible) {
		const domNode = findDOMNode<any>(this);
		if (!domNode) {
			return;
		}

		const hasVisibilityChanged = this.isVisible !== isVisible;
		if (hasVisibilityChanged) {
			this.isVisible = isVisible;
			if (isVisible && !this.isViewed) {
				this.isViewed = true;
				domNode.dispatchEvent(new CustomEvent('viewed'));
			}
		}
	}

	getChildContext() {
		return {
			getContextEntryData: event => this.props.getEventData(this.context, event, this)
		};
	}
}

type ImagesProp = { [_ in image.Type]?: string };

const mapImagesToImageDetail = (images: ImagesProp) =>
	Object.entries(images || []).map(([type, url]) => ({ url, type, id: getImageIdFromUrL(url) }));

const entryListImagesGetter = (imageQuery: string) => (props: PageEntryListProps) =>
	props.list.images && { imageQuery, images: mapImagesToImageDetail(props.list.images) };

const imageEntryGetter = (imageQuery: string) => (props: PageEntryImageProps) =>
	props.images && { imageQuery, images: mapImagesToImageDetail(props.images) };

const entryListItemsImagesGetter = (imageQuery: string) => (props: CarouselProps) =>
	props.list.items && {
		imageQuery,
		images: Object.values(props.list.items).reduce((acc, { images }) => [...acc, ...mapImagesToImageDetail(images)], [])
	};

const packshotListImageGetter = entryListImagesGetter('.packshot-list__packshot pb1__hero img.img-r');
const brandedImageGetter = entryListImagesGetter('img.branded-image__breakout-img');
const wallPaperImageGetter = entryListImagesGetter('img.wallpaper__image');

interface TemplateImageGetterMap {
	[key: string]: (props: TemplateMapProps) => IEntryImageDetails;
}

type TemplateMapProps = PageEntryImageProps | CarouselProps | PageEntryListProps;

// 'carousel-item.carousel-item--in-view img.carousel-item__image'

export const entryTemplateImageGetterMap: TemplateImageGetterMap = {
	[H9Image]: imageEntryGetter('img.h9__picture'),
	[H5Thumbnails]: entryListItemsImagesGetter('img.carousel-item__image'),
	[Pb1Cover]: packshotListImageGetter,
	[Sb1Cover]: packshotListImageGetter,
	[Tb1Cover]: packshotListImageGetter,
	[Pb2Text]: packshotListImageGetter,
	[Sb2Text]: packshotListImageGetter,
	[Tb2Text]: packshotListImageGetter,
	[Tb3Background]: wallPaperImageGetter,
	[Sb3Background]: wallPaperImageGetter,
	[Pb3Background]: wallPaperImageGetter,
	[Pb4Image]: brandedImageGetter,
	[Tb4Image]: brandedImageGetter,
	[Sb4Image]: brandedImageGetter
};

export const wrapAnalyticsEntry = function<P extends EntryProps>(
	Wrapped: React.ComponentType<P>,
	getImageDetails?: (props: P) => IEntryImageDetails
): React.SFC<P> {
	return (props: P) => {
		const _getImageDetails = getImageDetails || entryTemplateImageGetterMap[props.template];
		return createElement(
			AnalyticsEntryWrapper,
			{
				events: EVENTS,
				sourceType: DomEventSourceType.Entry,
				getEventData: getEntryEventData(props, _getImageDetails)
			},
			createElement(Wrapped as any, props)
		);
	};
};

function attachScrollManagerEvents() {
	window.addEventListener(
		'scroll',
		debounce(() => EntryScrollManager.handleScroll(), secondsToMs(IMPRESSION_TIME_SECS), false)
	);

	window.addEventListener('resize', refreshScrollManagerDebounced);
	// Images loading causes our page to re-flow - it might mess up our detection of where entries are so we need to refresh
	document.addEventListener('load', refreshScrollManagerDebounced, true);
}

if (!_SSR_) {
	attachScrollManagerEvents();
}
