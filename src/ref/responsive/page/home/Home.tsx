import * as React from 'react';
import { configPage } from 'shared/';
import { Home as template } from 'shared/page/pageTemplate';
import { Category } from '../category/Category';
import entryRenderers from '../category/categoryEntries';

// The homepage is identical to the category page, and exists
// as a point of difference purely for operator convenience
// within Presentation Manager.
function Home(props: PageProps) {
	return <Category {...props} />;
}

export default configPage(Home, {
	template,
	entryRenderers
});
