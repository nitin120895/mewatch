import * as React from 'react';
import { configPage } from 'shared/';
import { Watch as watchPageTemplate } from 'shared/page/pageTemplate';
import {
	EmbedPlayer as embedPlayerEntryTemplate,
	PlayerStandard as standardPlayerEntryTemplate
} from 'shared/page/pageEntryTemplate';
import EmbedPlayer from '../player/EmbedPlayer';
import PageNotFound from 'toggle/responsive/page/PageNotFound';

class Embed extends React.Component<PageProps, any> {
	render() {
		let { entries, loading } = this.props;
		if (!entries && !loading) return <PageNotFound {...this.props} />;

		// Replace Standard Player entry template with Embed Player
		const playerEntry = entries && entries.find(entry => entry.template === standardPlayerEntryTemplate);
		if (playerEntry) playerEntry.template = embedPlayerEntryTemplate;

		return <div className="pg-watch">{this.props.renderEntries()}</div>;
	}
}

export default configPage(Embed, {
	theme: 'watch',
	template: watchPageTemplate,
	entryRenderers: [EmbedPlayer]
});
