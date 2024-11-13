import * as React from 'react';
import { configPage } from 'shared/';
import { EPG as template } from 'shared/page/pageTemplate';
import EPG2 from '../../pageEntry/epg/EPG2';

import './EPG.scss';

const EPG = (props: PageProps) => <div className="pg-epg">{renderEntries(props)}</div>;

function renderEntries({ entries, renderEntry, item }: PageProps) {
	return (entries || []).map((entry, index) => {
		return renderEntry(entry, index, { item });
	});
}
export default configPage(EPG, {
	template,
	entryRenderers: [EPG2],
	preventScrollRestoration: true
});
