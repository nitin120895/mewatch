import * as React from 'react';
import { configPage } from 'shared/';
import entryRenderers from './categoryEntries';

function Category({ renderEntries }: PageProps) {
	return <div className="content-margin">{renderEntries()}</div>;
}

export default configPage(Category, {
	template: 'Category',
	entryRenderers
});
