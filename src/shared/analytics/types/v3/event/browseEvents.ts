export interface BrowserSearchDetails {
	term: string;
	totalResults: number;
	resultsByType: {
		[key: string]: number;
	};
}

export interface BrowserRecommendSearchDetails {
	term: string;
	item: api.ItemSummary;
}

export interface FilterRequestDetails {
	filterType: string;
	filterValue: string;
}

export interface ListPageDetails {
	cardTotal: number;
	trigger?: string;
}

export interface ProgramTagDetails {
	tagType: string;
	tagValue: string;
}

export interface PageViewedDetails {
	entryPoint?: string;
}
