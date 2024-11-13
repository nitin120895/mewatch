import * as React from 'react';
import { configPage } from 'shared/';
import { SubCategory as template } from 'shared/page/pageTemplate';
import entryRenderers from './subCategoryEntries';

const SubCategory = ({ renderEntries }: PageProps) => <div className="pg-sub-category">{renderEntries()}</div>;

export default configPage(SubCategory, {
	template,
	entryRenderers
});
