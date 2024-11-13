import * as React from 'react';
import { configPage } from 'shared/';
import entryRenderers from './playerEntries';

function Watch({ renderEntries }: PageProps) {
	return <div>{renderEntries()}</div>;
}

export default configPage(Watch, {
	template: 'Watch',
	entryRenderers
});
