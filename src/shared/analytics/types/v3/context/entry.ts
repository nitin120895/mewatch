export interface IEntryContext {
	pagePath?: string;
	type: EntryContextTypes;
	title: string;
	template: string;
	position: number;
	key?: string;
	list?: any;
}

export enum EntryContextTypes {
	List = 'list',
	Item = 'item',
	User = 'user',
	Text = 'text',
	Image = 'image',
	Search = 'search',
	Default = 'default',
	Custom = 'custom'
}

export interface Image {
	id: string;
	type: string;
	url: string;
}

type ServiceTypes = { [key: string]: EntryContextTypes };
export const ServiceTypeMap: ServiceTypes = {
	ItemEntry: EntryContextTypes.Item,
	ItemDetailEntry: EntryContextTypes.Item,
	ListEntry: EntryContextTypes.List,
	ListDetailEntry: EntryContextTypes.List,
	UserEntry: EntryContextTypes.User,
	TextEntry: EntryContextTypes.Text,
	ImageEntry: EntryContextTypes.Image,
	CustomEntry: EntryContextTypes.Custom,
	PeopleEntry: EntryContextTypes.Search
};

export interface CustomEntryContext extends IEntryContext {
	type: EntryContextTypes.Custom;
	data: string;
}

export interface ImageEntryContext extends IEntryContext {
	type: EntryContextTypes.Image;
	image: Image;
}

export enum ItemTypeKeys {
	Movie = 'movie',
	Show = 'show',
	Season = 'season',
	Episode = 'episode',
	Program = 'program',
	Link = 'link',
	Trailer = 'trailer',
	Channel = 'channel'
}

export interface ItemContext {
	id: string;
	customId: string;
	currentTime: number;
	duration: number;
	releaseYear: number;
	offers: api.Offer[];
	title: string;
	path: string;
	type: ItemTypeKeys;
	showTitle?: string;
	genres: string[];
	customFields: { [key: string]: any };
	episodeNumber?: number;
	episodeName?: string;
	categories: string[];
	watchPath: string;
	subtype?: string;
	season?: api.ItemDetail;
	hooqContent?: boolean;
	seasonId?: string;
	seasonNumber?: number;
	showId?: string;
	scheduleItem?: api.ItemSchedule;
}

export interface ItemEntryContext extends IEntryContext {
	type: EntryContextTypes.Item;
	item: ItemContext;
	image?: Image;
}

export interface ListEntryContext extends IEntryContext {
	type: EntryContextTypes.List;
	list: {
		id: string;
		title: string;
		size: number;
	};
	image?: Image;
}

export interface SearchEntryContext extends IEntryContext {
	type: EntryContextTypes.Search;
	key: 'items' | 'movies' | 'tv' | 'people';
	template: '';
	search: {
		term: string;
		size: number;
	};
}

export interface TextEntryContext extends IEntryContext {
	type: EntryContextTypes.Text;
	text: string;
}

export interface UserEntryContext extends IEntryContext {
	type: EntryContextTypes.User;
	userList?: {
		id: string;
		size: string;
	};
}

export interface DefaultEntryContext extends IEntryContext {
	type: EntryContextTypes.Default;
}

export type EntryContext =
	| ListEntryContext
	| ItemEntryContext
	| UserEntryContext
	| TextEntryContext
	| ImageEntryContext
	| SearchEntryContext
	| CustomEntryContext
	| DefaultEntryContext;
