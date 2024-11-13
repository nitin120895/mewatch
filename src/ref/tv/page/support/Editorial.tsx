import * as React from 'react';
import { configPage } from 'shared/';
import { Editorial as template } from 'shared/page/pageTemplate';
import entryRenderers from './editorialEntries';

const Editorial = ({ renderEntries }: PageProps) => (
	<div className={`pg-${template.toLowerCase()}`}>{renderEntries()}</div>
);

export default configPage(Editorial, {
	template,
	entryRenderers
});
