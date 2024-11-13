import * as React from 'react';
import { resolveImages } from 'shared/util/images';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { setItem, getItem, removeItem } from 'shared/util/localStorage';
import {
	setItem as setSessionStorageItem,
	getItem as getSessionStorageItem,
	removeItem as removeSessionStorageItem
} from 'shared/util/sessionStorage';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { get } from 'shared/util/objects';

const REMINDER_DATA = 'reminderData';
const EPG_SAVED_STATE = 'epgSavedState';
const EPG_SAVED_DATE = 'epgSavedDate';
const GAMES_SCHEDULE_FILTERS = 'gamesScheduleFilters';

interface ReminderDataType {
	scheduleItem: api.ItemSchedule;
	channel: api.ItemSummary;
}

export enum EPG2ItemState {
	PAST = 'PAST',
	ON_NOW = 'ON_NOW',
	FUTURE = 'FUTURE'
}

export function isOnNowState(epgItemState: EPG2ItemState): boolean {
	return epgItemState === EPG2ItemState.ON_NOW;
}

export function isFutureState(epgItemState: EPG2ItemState): boolean {
	return epgItemState === EPG2ItemState.FUTURE;
}

export function isPastState(epgItemState: EPG2ItemState): boolean {
	return epgItemState === EPG2ItemState.PAST;
}

const tabletBreakpoint = BREAKPOINT_RANGES['tablet'];
const mediaQueryMobile = `(max-width: ${tabletBreakpoint.min - 1}px)`;
const mediaQueryDesktop = `(min-width: ${tabletBreakpoint.min}px)`;

export function resolveChannelLogo(channel: api.ItemSummary | api.ScheduleItemSummary, imageType?: image.Type) {
	const { images } = channel;
	const squareType = get(images, 'square');
	const imgType = imageType || (squareType ? 'square' : 'logo');
	return resolveImages(images, imgType, {
		width: 100,
		format: 'png'
	})[0].src;
}

export function resolveItemImage(item: api.ScheduleItemSummary) {
	if (!item.images) return;

	return [
		{
			src: resolveImages(item.images, 'tile', { width: 360 })[0].src,
			mediaQuery: mediaQueryMobile
		},
		{
			src: resolveImages(item.images, 'tile', { width: 720 })[0].src,
			mediaQuery: mediaQueryDesktop
		}
	];
}

export function isChannel(item: api.ItemSummary): boolean {
	return item && item.type === 'channel';
}

export function noCurrentProgram(currentProgram: api.ItemSchedule, schedules: api.ItemSchedule[]): boolean {
	const now = new Date().getTime();
	const noProgram =
		currentProgram && (currentProgram.startDate.getTime() > now || currentProgram.endDate.getTime() < now);
	return schedules && schedules.length && (currentProgram === undefined || currentProgram.isGap || noProgram);
}

export function noSchedule(schedules: api.ItemSchedule[]): boolean {
	return !schedules || (schedules && schedules.length === 0);
}

export const getReminderData = (): ReminderDataType => {
	return getItem(REMINDER_DATA);
};

export const setReminderData = (data: ReminderDataType) => {
	setItem(REMINDER_DATA, data);
};

export const removeReminderData = () => {
	removeItem(REMINDER_DATA);
};

export const getReminder = (scheduleItem: api.ItemSchedule, reminders: api.Reminder[]): api.Reminder | undefined => {
	if (!reminders || !reminders.length) return;
	return reminders.find(reminder => {
		return reminder.schedule.customId === scheduleItem.customId;
	});
};

export const getReminderNotificationContent = (reminderOffset: number) => {
	return {
		content: <IntlFormatter values={{ reminderOffset }}>{'@{reminder_modal_toast_text}'}</IntlFormatter>
	};
};

export const getDeleteReminderNotificationContent = () => {
	return {
		content: <IntlFormatter>{'@{reminder_deleted_modal_toast_text}'}</IntlFormatter>
	};
};

export const saveChannel = (channel: api.ItemSummary) => {
	setItem(EPG_SAVED_STATE, channel);
};

export const getSavedChannel = (): api.ItemSummary => {
	return getItem(EPG_SAVED_STATE);
};

export const removeSavedChannel = () => {
	removeItem(EPG_SAVED_STATE);
};

export const saveEPGDate = (date: Date) => {
	setSessionStorageItem(EPG_SAVED_DATE, date.toString());
};

export const getSavedEPGDate = (): string => {
	return getSessionStorageItem(EPG_SAVED_DATE);
};

export const removeSavedEPGDate = () => {
	removeSessionStorageItem(EPG_SAVED_DATE);
};

export const saveGameScheduleFilters = (gameScheduleFilters: any) => {
	setItem(GAMES_SCHEDULE_FILTERS, JSON.stringify(gameScheduleFilters));
};

export const getGameScheduleFilters = (): any => {
	let filters = getItem(GAMES_SCHEDULE_FILTERS);
	if (filters) return JSON.parse(filters);
	return {};
};

export const removeGameScheduleFilters = () => {
	removeItem(GAMES_SCHEDULE_FILTERS);
};
