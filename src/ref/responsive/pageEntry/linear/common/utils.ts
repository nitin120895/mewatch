import { resolveImages } from 'shared/util/images';
import { omit } from 'shared/util/objects';
import { isBetween } from 'shared/util/dates';
import { hexToRgba } from 'shared/util/styles';

const CH2_MAX_TILES = 12;
export const CH2_MAX_TILES_WITH_ON_NOW = 13;

export function isChannel(item: api.ItemSummary): boolean {
	return item.type === 'channel';
}

export function isOnNow({ startDate, endDate, blackout }: any): boolean {
	return !blackout && isBetween(new Date(), startDate, endDate);
}

export function isNoScheduledItem(schedules: api.ItemSchedule[]): boolean {
	return !schedules.length;
}

export function getColor(
	themes: Array<api.Theme> = [],
	type: api.Theme['type'],
	name: api.ThemeColor['name']
): api.ThemeColor {
	const theme = themes.find(theme => theme.type === type);
	return theme && theme.colors.find(color => color.name === name);
}

export function getChannelBackgroundColor(channel: any): api.ThemeColor {
	return getColor(channel.themes, 'Background', 'Primary');
}

export function convertColorToBackgroundStyle(color: api.ThemeColor): object {
	if (color) {
		const rgba = hexToRgba(color.value, color.opacity);
		return { backgroundColor: rgba };
	}
	return {};
}

export function resolveChannelLogo(channel: api.ItemSummary): string {
	const { images } = channel;
	const imgType = images && images.square ? 'square' : 'logo';
	return resolveImages(images, imgType, {
		width: 100,
		format: 'png'
	})[0].src;
}

function convertScheduleToSummaryList(id: string, list: any[]): api.ItemList {
	const items = list.map(schedule => ({ ...schedule.item, schedule: omit(schedule, 'item') }));
	return { id, key: id, items, size: items.length, path: '', paging: { page: 1, total: 1 } };
}

function createViewFullScheduleItem(path: string): api.ItemSummary {
	return { id: path, path, type: 'link', title: `@{view_full_schedule|View Full Schedule}` };
}

function addItemToSummaryList(item: api.ItemSummary, list: api.ItemList): api.ItemList {
	return { ...list, items: [...list.items, item], size: list.size + 1 };
}

function getCH2RowList(list: any[] = []): api.ItemSchedule[] {
	// take not blackout items
	const scheduleList = list.filter(i => !i.blackout);

	if (scheduleList.length) {
		// take Up Next rows along with/without On Now
		return scheduleList.slice(0, isOnNow(scheduleList[0]) ? CH2_MAX_TILES_WITH_ON_NOW : CH2_MAX_TILES);
	}
	return scheduleList;
}

export function getCH2RowListWithFullSchedule(
	item: api.ItemSummary,
	list: api.ItemSchedule[],
	fullSchedulePath: string
): api.ItemList {
	const scheduleList = getCH2RowList(list);
	const summaryList = convertScheduleToSummaryList(item.id, scheduleList);

	if (item.path) {
		const fullScheduleItem = createViewFullScheduleItem(fullSchedulePath);
		return addItemToSummaryList(fullScheduleItem, summaryList);
	}
	return summaryList;
}

export function getEPG3RowList(list: api.ItemList): api.ItemList {
	// take only channel type items
	const items = list.items.filter(item => item.type === 'channel');

	return { ...list, items, size: items.length };
}

export function getOutstandingSchedules(schedules: api.ItemSchedule[]): api.ItemSchedule[] {
	const now = Date.now();
	return (
		schedules
			// take only time valid assets
			.filter(i => new Date(i.endDate).getTime() > now)
			// sort schedule list by start date
			.sort((i, j) => new Date(i.startDate).getTime() - new Date(j.startDate).getTime())
	);
}

export const getCurrentProgram = (schedules: api.ItemSchedule[]): api.ItemSchedule | undefined => {
	return schedules && schedules.length && schedules[0];
};
