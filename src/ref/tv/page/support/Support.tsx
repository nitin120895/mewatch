import * as React from 'react';
import { configPage } from 'shared/';
import { Support as template } from 'shared/page/pageTemplate';
import entryRenderers from './supportEntries';

const Support = ({ renderEntries }: PageProps) => (
	<div className={`pg-${template.toLowerCase()}`}>{renderEntries()}</div>
);

export default configPage(Support, {
	template,
	entryRenderers
});
