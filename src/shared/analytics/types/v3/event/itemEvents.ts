import { Image } from '../context/entry';

export interface ItemOffer {
	title: string;
	type: string;
	sku: string;
	price: number;
	currency?: string;
}

export interface IItemActionedTrackingEventDetail {
	action: string;
	value: string;
}

export interface IItemOfferTrackingEventDetail {
	offer: ItemOffer;
}

export interface IItemOfferedTrackingEventDetail extends IItemOfferTrackingEventDetail {
	action: string;
}

export interface IItemInteractionEventDetail {
	cardTotal?: number;
	image?: Image;
	position: number;
	sorting?: string;
}

export interface IItemIDPLinkClickDetails {
	linkUrl: string;
}

export interface IItemInfoLinkClickDetails {
	currentTime?: number;
	linkCta: string;
	linkDescription: string;
	linkUrl: string;
	subtitleLanguages?: string[];
}

export interface IItemCwMenuEventDetail {
	position: number;
	cardTotal: number;
	railPosition: number;
}
