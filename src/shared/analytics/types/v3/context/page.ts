interface PageTemplate {
	name: string;
	isStatic: boolean;
}

export interface PageContext {
	title: string;
	path: string;
	id: string;
	pageKey?: string;
	keywords?: string[];
	template?: PageTemplate;
	url: string;
	referrer: string;
	entries?: number;
	prevPath?: string;
}
