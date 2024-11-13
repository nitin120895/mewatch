import * as React from 'react';

import { isMobile } from 'shared/util/browser';
import { Bem } from 'shared/util/styles';
import {
	generateGoogleCalendarUrl,
	generateIcsCalendarFile,
	generateOutlookCalendarUrl,
	formatCalendarAppLinkHash,
	CalendarEvent
} from 'toggle/responsive/component/AddToCalendarButton/utils';

import AppleIcon from 'toggle/responsive/component/AddToCalendarButton/icons/AppleIcon';
import GoogleIcon from 'toggle/responsive/component/AddToCalendarButton/icons/GoogleIcon';
import ICalIcon from 'toggle/responsive/component/AddToCalendarButton/icons/ICalIcon';
import OutlookIcon from 'toggle/responsive/component/AddToCalendarButton/icons/OutlookIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './AddtoCalendarButton.scss';

const bem = new Bem('add-to-calendar-button-tooltip');
interface AddToCalendarButtonTooltipProps {
	calendarEvent: CalendarEvent;
	className?: string;
	isAppWebView?: boolean;
}

export default function AddToCalendarButtonTooltip({ calendarEvent, isAppWebView }: AddToCalendarButtonTooltipProps) {
	const isMobileBrowser = isMobile();

	const calendars = [
		{
			name: 'apple',
			label: '@{epg_add_to_calendar_dropdown_apple|Apple}',
			webLink: generateIcsCalendarFile(calendarEvent),
			logo: <AppleIcon className={bem.e('calendar-icon')} />
		},
		{
			name: 'google',
			label: '@{epg_add_to_calendar_dropdown_google|Google}',
			webLink: generateGoogleCalendarUrl(calendarEvent),
			logo: <GoogleIcon className={bem.e('calendar-icon')} />
		},
		{
			name: 'ical',
			label: '@{epg_add_to_calendar_dropdown_ical_file|iCal File}',
			webLink: generateIcsCalendarFile(calendarEvent),
			logo: <ICalIcon className={bem.e('calendar-icon')} />
		},
		{
			name: 'outlook',
			label: 'Outlook.com',
			webLink: isMobileBrowser ? generateIcsCalendarFile(calendarEvent) : generateOutlookCalendarUrl(calendarEvent),
			logo: <OutlookIcon className={bem.e('calendar-icon')} />
		}
	];

	return (
		<div className={bem.b()}>
			{calendars.map(cal => {
				const { name, label, webLink, logo } = cal;
				const isGoogleCal = name === 'google';
				const link = isAppWebView ? formatCalendarAppLinkHash(calendarEvent, isGoogleCal) : webLink;
				return (
					<button key={name} onClick={e => e.stopPropagation()}>
						<a href={link} rel="noopener noreferrer" target="_blank" className={bem.e('calendar-provider-link')}>
							{logo}
							<IntlFormatter> {label}</IntlFormatter>
						</a>
					</button>
				);
			})}
		</div>
	);
}
