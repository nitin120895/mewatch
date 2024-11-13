import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';
import { PlayerStandard as playerEntryTemplate } from 'shared/page/pageEntryTemplate';
import PlayerStandard from './PlayerStandard';
import CastPlayerStandard from './cast/CastPlayerStandard';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { ShowDetail as showDetailKey } from 'shared/page/pageKey';
import { get } from 'shared/util/objects';
import { isTrailer, isEpisode } from '../util/item';

interface FullScreenPlayerStandardProps extends PageProps {
	historyIndex: number;
	config?: state.Config;
	isCastActive?: boolean;
}

class FullScreenPlayerStandard extends React.Component<FullScreenPlayerStandardProps> {
	shouldComponentUpdate(nextProps: FullScreenPlayerStandardProps) {
		return !(this.props.isCastActive && !nextProps.isCastActive);
	}

	onPlayerClosed = () => {
		if (this.props.historyIndex > 0) {
			browserHistory.goBack();
		} else {
			this.onPlayerBack();
		}
	};

	onPlayerBack = () => {
		const { item, config, historyIndex } = this.props;
		if (isTrailer(item)) {
			// for trailers we haven't path defined, just move one step back in history
			if (historyIndex > 0) {
				browserHistory.goBack();
			} else {
				browserHistory.replace(item.path);
			}
		} else {
			let redirectPath = item.path;
			if (isEpisode(item)) {
				// try to get show detail page from parent hierarchy
				redirectPath = get(item, 'season.show.path');

				// in case we have not season and show as parent items for episode
				if (!redirectPath) {
					const path = getPathByKey(showDetailKey, config);
					redirectPath = path.replace(':id', item.showId);
				}
			}

			browserHistory.replace(redirectPath);
		}
	};

	render() {
		if (this.props.isCastActive) return <CastPlayerStandard {...this.props} onBack={this.onPlayerBack} />;
		return <PlayerStandard {...this.props} onClose={this.onPlayerClosed} onBack={this.onPlayerBack} />;
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const { player } = state;
	const { connectionStatus } = player.cast;
	return {
		historyIndex: state.page.history.index,
		config: state.app.config,
		isCastActive: connectionStatus === 'Connecting' || connectionStatus === 'Connected'
	};
}

const Component: any = connect<FullScreenPlayerStandardProps, any, any>(mapStateToProps)(FullScreenPlayerStandard);
Component.template = playerEntryTemplate;
export default Component;
