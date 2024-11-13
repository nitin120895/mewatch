import * as React from 'react';
import { configPage } from 'shared/';
import { Watch as watchPageTemplate } from 'shared/page/pageTemplate';
import { browserHistory } from 'shared/util/browserHistory';
import FullScreenPlayerStandard from '../../player/FullScreenPlayerStandard';

interface StateProps {
	pageNotFound: boolean;
}

type WatchPageProps = PageProps & StateProps;

class Watch extends React.Component<WatchPageProps, any> {
	componentDidUpdate(prevProps: WatchPageProps) {
		if (this.props.pageNotFound && !prevProps.pageNotFound) {
			browserHistory.push('/404');
		}
	}

	render() {
		const { renderEntries } = this.props;
		return <div className="pg-watch">{renderEntries()}</div>;
	}
}

const mapStateToProps = ({ page }: state.Root) => ({
	pageNotFound: !page.loading && page.showPageNotFound
});

export default configPage(Watch, {
	theme: 'watch',
	template: watchPageTemplate,
	entryRenderers: [FullScreenPlayerStandard],
	mapStateToProps
});
