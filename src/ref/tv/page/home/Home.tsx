import * as React from 'react';
import { configPage } from 'shared/';
import entryRenderers from '../category/categoryEntries';

function Home({ renderEntries }: PageProps) {
	return <div className="content-margin">{renderEntries()}</div>;
}

export default configPage(Home, {
	template: 'Home',
	entryRenderers
});
