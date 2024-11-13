import { EntryContext } from './entry';
import { ItemContext } from './entry';
import { PageContext } from './page';
import { SessionContext } from './session';
import { UserContext } from './user';

export type ContextProperty = {
	entry: EntryContext;
	page: PageContext;
	session: SessionContext;
	user: UserContext;
	item: ItemContext;
	listData: api.ListData;
};

export type BasicContextProperty = Pick<ContextProperty, 'session' | 'user'>;

export type StandardContextProperty = Pick<ContextProperty, 'session' | 'user' | 'page'>;

export interface EntryContextProperty extends StandardContextProperty {
	entry: EntryContext;
}

export interface ItemContextProperty extends EntryContextProperty {
	item: ItemContext;
	listData?: api.ListData;
}
