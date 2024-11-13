import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';
import { PlayerStandard as playerEntryTemplate } from 'shared/page/pageEntryTemplate';
import PlayerStandard from './PlayerStandard';
import CastPlayerStandard from './cast/CastPlayerStandard';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { findPageSummaryByPath, getPathByKey } from 'shared/page/sitemapLookup';
import {
	Home,
	ShowDetail as showDetailKey,
	SeasonDetail as seasonDetailKey,
	EpisodeDetail as episodeDetailKey
} from 'shared/page/pageKey';
import {
	ContinueWatch as ContinueWatchingTemplate,
	SportsEvent as sportsEventTemplate
} from 'shared/page/pageTemplate';
import { get } from 'shared/util/objects';
import { isTrailer, isEpisode } from 'toggle/responsive/util/item';

interface FullScreenPlayerStandardProps extends PageProps {
	pageHistory: state.PageHistoryEntry[];
	historyIndex: number;
	pageCache: any;
	config?: state.Config;
	isCastActive?: boolean;
	homepageUrl?: string;
	xt1ChainPlayList: number | string;
	chainPlayOrigin?: string;
}

class FullScreenPlayerStandard extends React.Component<FullScreenPlayerStandardProps> {
	private historyKey = undefined;

	shouldComponentUpdate(nextProps: FullScreenPlayerStandardProps) {
		return !(this.props.isCastActive && !nextProps.isCastActive);
	}

	componentDidMount() {
		this.historyKey = get(window.history, 'state.key');
		window.onpopstate = e => {
			if (get(window.history, 'state.key') === this.historyKey) return;

			const backToPrevPage = location.search.includes('redirect');
			const { homepageUrl } = this.props;

			fullscreenService.switchOffFullscreen();

			if (backToPrevPage) {
				browserHistory.replace(homepageUrl);
			}
		};
	}

	isItemDetailPage = path => {
		const { pageCache } = this.props;
		return pageCache[path] && [showDetailKey, seasonDetailKey, episodeDetailKey].includes(pageCache[path].key);
	};

	isGamesSchedulePage = path => {
		const { pageCache, config } = this.props;
		const page = pageCache[path];
		if (page) {
			return page && [sportsEventTemplate].includes(pageCache[path].template);
		} else {
			const page = findPageSummaryByPath(path, config);
			return page && page.template === sportsEventTemplate;
		}
	};

	isContinueWatchingItem = path => {
		const { pageCache, config } = this.props;
		const page = pageCache[path];
		if (page) {
			return page && [ContinueWatchingTemplate, Home].includes(pageCache[path].template);
		} else {
			const page = findPageSummaryByPath(path, config);
			return page && page.template === ContinueWatchingTemplate;
		}
	};

	onPlayerClosed = () => {
		if (this.props.historyIndex > 0) {
			browserHistory.goBack();
		} else {
			this.onPlayerBack();
		}
	};

	onPlayerBack = () => {
		const { item, config, pageHistory, historyIndex, location, xt1ChainPlayList } = this.props;
		let redirectPath = item.path;

		const backToPrevPage = location.search && location.search.includes('redirect');
		const prevPage = pageHistory[historyIndex - 1];

		if (backToPrevPage || xt1ChainPlayList) {
			browserHistory.goBack();
		} else if (isTrailer(item)) {
			// for trailers we don't have path defined, just move one step back in history
			if (historyIndex > 0) {
				browserHistory.goBack();
			} else {
				browserHistory.replace(item.path);
			}
		} else {
			if (isEpisode(item)) {
				redirectPath = get(item, 'season.path');
				// in case we have not season and show as parent items for episode
				if (!redirectPath) {
					const path = getPathByKey(showDetailKey, config);
					redirectPath = path.replace(':id', item.showId);
				}
			}

			if (
				prevPage &&
				(this.isItemDetailPage(prevPage.path) ||
					this.isGamesSchedulePage(prevPage.path) ||
					this.isContinueWatchingItem(prevPage.path))
			) {
				browserHistory.goBack();
			} else {
				browserHistory.replace(redirectPath);
			}
		}
	};

	render() {
		const { isCastActive } = this.props;

		if (isCastActive) {
			return <CastPlayerStandard {...this.props} onBack={this.onPlayerBack} />;
		} else {
			return <PlayerStandard {...this.props} onClose={this.onPlayerClosed} onBack={this.onPlayerBack} />;
		}
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const { player } = state;
	const { connectionStatus } = player.cast;
	const { xt1ChainPlayList, chainPlayOrigin } = player;
	return {
		pageHistory: state.page.history.entries,
		historyIndex: state.page.history.index,
		pageCache: state.cache.page,
		config: state.app.config,
		homepageUrl: getPathByKey(Home, state.app.config),
		isCastActive: connectionStatus === 'Connecting' || connectionStatus === 'Connected',
		xt1ChainPlayList,
		chainPlayOrigin
	};
}

const Component: any = connect<FullScreenPlayerStandardProps, any, any>(mapStateToProps)(FullScreenPlayerStandard);
Component.template = playerEntryTemplate;
export default Component;
