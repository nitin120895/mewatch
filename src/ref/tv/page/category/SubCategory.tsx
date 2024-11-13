import * as React from 'react';
import { configPage } from 'shared/';
import SubcategoryHead from '../../component/SubcategoryHead';
import entryRenderers from './subCategoryEntries';

const SubCategory = ({ id, title, renderEntries, template, savedState }: PageProps) => (
	<div>
		<SubcategoryHead id={id} title={title} template={template} savedState={savedState} />
		<div className="content-margin">{renderEntries()}</div>
	</div>
);

export default configPage(SubCategory, {
	template: 'SubCategory',
	entryRenderers
});
