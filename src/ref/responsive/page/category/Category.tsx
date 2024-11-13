import * as React from 'react';
import { configPage } from 'shared/';
import { Category as template } from 'shared/page/pageTemplate';
import entryRenderers from './categoryEntries';

export function Category({ renderEntries }: PageProps) {
	return <div className="pg-category">{renderEntries()}</div>;
}

export default configPage(Category, {
	template,
	entryRenderers
});
