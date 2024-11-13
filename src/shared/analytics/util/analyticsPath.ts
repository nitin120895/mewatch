import { capitalizeStr } from 'shared/util/strings';
import { EpisodeSortingOrder } from 'toggle/responsive/pageEntry/itemDetail/d2/EpisodeSortingSelector';
import { RANGE_OPTION_ALL } from 'toggle/responsive/pageEntry/itemDetail/d2/EpisodeRangeSelector';
import { EpisodeRange } from 'toggle/responsive/pageEntry/utils/episodeRange';

import { compareDate } from 'shared/util/dates';

export function subscriptionPlanPath(plan: api.PricePlan): string {
	if (!plan || !plan.id) return undefined;
	return window.location.pathname + '-view-plan-' + plan.id;
}

export function subscriptionPaymentSummaryPath(plan: api.PricePlan): string {
	if (!plan || !plan.id) return undefined;
	return window.location.pathname + '-payment-summary-' + plan.id;
}

export function subscriptionPaymentMethodPath(plan: api.PricePlan): string {
	if (!plan || !plan.id) return undefined;
	return window.location.pathname + '-payment-method-' + plan.id;
}

export function subscriptionPaymentSuccessPath(planId: string): string {
	if (!planId) return undefined;
	return window.location.pathname + '-payment-success-' + planId;
}

export function subscriptionPaymentFailedPath(planId: string): string {
	if (!planId) return undefined;
	return window.location.pathname + '-payment-fail-' + planId;
}

export function searchLanguagePath(languageCode: string) {
	if (!languageCode) return undefined;
	return window.location.pathname + '_' + languageCode.toLowerCase();
}

function replaceWhiteSpace(string: string): string {
	return string.replace(/\s/g, '');
}

export function getListDetailsLanguage(language: string): string {
	language = language.toLowerCase();
	language = capitalizeStr(language);
	return replaceWhiteSpace(language);
}

export function getListDetailsClassification(classification: string): string {
	return replaceWhiteSpace(classification);
}

export function getListDetailsSort(sort: string): string {
	if (sort === 'a-z' || sort === 'z-a') {
		sort = sort.toUpperCase();
	} else {
		sort = sort.replace('-', ' ');
	}
	sort = capitalizeStr(sort);
	sort = replaceWhiteSpace(sort);
	return sort;
}

export function getListDetailsGenre(genre: string): string {
	genre = genre.toLowerCase();
	genre = capitalizeStr(genre);
	return replaceWhiteSpace(genre);
}

export function listDetailsPath(language, classification, sort, genre): string {
	let path = window.location.pathname;

	if (language) {
		let languageLabel = getListDetailsLanguage(language);
		path += `/${languageLabel}`;
	}

	if (classification) {
		const classificationLabel = getListDetailsClassification(classification);
		path += `_${classificationLabel}`;
	}

	if (sort) {
		const sortLabel = getListDetailsSort(sort);
		path += `_${sortLabel}`;
	}

	if (genre) {
		const genreLabel = getListDetailsGenre(genre);
		path += `_${genreLabel}`;
	}

	return path;
}

export function itemDetailPath(range?: EpisodeRange, sort?: EpisodeSortingOrder): string {
	let path = window.location.pathname;

	if (!range) return path;

	if (range) {
		if (range.key === RANGE_OPTION_ALL) {
			path += '/AllEpisodes';
		} else if (range.from && range.to) {
			path += `/${range.from}-${range.to}`;
		}
	}

	if (sort) {
		const sortLabel = (sort as string).charAt(0).toUpperCase() + sort.slice(1);
		path += `_${sortLabel}`;
	}

	return path;
}

export function epgPath() {
	return window.location.pathname;
}

export function epgSchedulePath(date: Date, title: string) {
	if (!date || !title) return undefined;

	const today = new Date();
	const isToday = compareDate(date, today) === 0;

	const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	let day;
	if (isToday) {
		day = 'Today';
	} else {
		day = shortDayNames[date.getDay()];
	}

	const monthLabel = `${date.getMonth() + 1}`.padStart(2, '0');
	const dateLabel = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}${monthLabel}`;

	title = title.replace(/\s/g, '-');

	return `${window.location.pathname}/${day.toUpperCase()}-${dateLabel}_${title}`;
}

export function epgScheduleItemPath(date: Date, itemTitle: string, channelTitle: string) {
	const channelDate = new Date(date.getTime());
	const channelPrefix = epgSchedulePath(channelDate, channelTitle);

	const hourLabel = `${date.getHours()}`.padStart(2, '0');
	const minutesLabel = `${date.getMinutes()}`.padStart(2, '0');

	const timeLabel = `${hourLabel}${minutesLabel}`;

	itemTitle = itemTitle.replace(/\s/g, '-');

	return `${channelPrefix}/${timeLabel}_${itemTitle}`;
}
