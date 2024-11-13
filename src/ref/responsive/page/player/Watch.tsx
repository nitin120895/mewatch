import * as React from 'react';
import { configPage } from 'shared/';
import { Watch as watchPageTemplate } from 'shared/page/pageTemplate';
import FullScreenPlayerStandard from '../../player/FullScreenPlayerStandard';

class Watch extends React.Component<PageProps, any> {
	render() {
		return <div className="pg-watch">{this.props.renderEntries()}</div>;
	}
}

export default configPage(Watch, {
	theme: 'watch',
	template: watchPageTemplate,
	entryRenderers: [FullScreenPlayerStandard]
});
