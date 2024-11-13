/**
 * Custom data associated with a sports EPG item.
 */
export interface GamesEPGItem {
	startDate?: Date;
	endDate?: Date;
	mediaId?: string;
	programLanguage?: string;
	liveIndicator?: boolean;
	syp?: string;
	programDescEnglish?: string;
	channelMediaId?: string;
	channelName?: string;
	id?: string;
	logoFlag?: boolean;
	eventName?: string;
	axisId: string;
	path: string;
}

export interface GamesScheduleList {
	/**
	 * The date and time this list of schedules starts.
	 */
	eventStartDate: Date;
	/**
	 * The date and time this list of schedules ends.
	 */
	eventEndDate: Date;
	/**
	 * The date and time this list of schedules is updated.
	 */
	lastUpdated: Date;
	/**
	 * The list of item schedules.
	 */
	epg: GamesEPGItem[];
}

export function getSportsEPG(apiUrl: string): Promise<any> {
	return fetch(apiUrl)
		.then(res => res.json())
		.then(response => {
			if (response.error) return { error: response.status };

			return response;
		})
		.catch(error => {
			return { error: error };
		});
}
