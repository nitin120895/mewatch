import * as React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { GamesEPGItem as GamesEPGItemType } from 'shared/linear/gamesSchedule';
import { browserHistory } from 'shared/util/browserHistory';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { Watch as watchPageKey } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { isEmbeddedView, isAppWebView, getAppLink } from 'shared/page/pageUtil';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { Bem } from 'shared/util/styles';
import { isOnNow } from 'toggle/responsive/util/channelUtil';
import { STARTOVER_QUERY_PARAM } from 'toggle/responsive/util/playerUtil';

import GamesEPGItemCTA from 'toggle/responsive/pageEntry/gamesSchedule/GamesEPGItemCTA';
import GamesEPGItemMetadata from 'toggle/responsive/pageEntry/gamesSchedule/GamesEPGItemMetadata';
import EPGDetailOverlay from 'toggle/responsive/pageEntry/gamesSchedule/EPGDetailOverlay';

import './GamesEPGItem.scss';

export const bem = new Bem('games-epg-item');
export const EPG_DETAIL_OVERLAY_MODAL_ID = 'sports-epg-detail-overlay';

interface Props {
	scheduleItem: GamesEPGItemType;
	sport: any;
	config: state.Config;
	location: HistoryLocation;
	icsContent: any;
	openModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	saveFilters?: () => void;
}

class GamesEPGItem extends React.Component<Props, any> {
	isVOD() {
		const { mediaId } = this.props.scheduleItem;
		return typeof mediaId !== 'undefined' && mediaId.length > 0;
	}

	onPlayClick = (e, startover = false) => {
		e.stopPropagation();

		const { config, location, saveFilters, scheduleItem } = this.props;
		if (!(config && location && scheduleItem)) return;

		const { axisId, path } = scheduleItem;
		if (!(axisId && path)) return;

		// Save selected filters before navigating away from page
		if (saveFilters) saveFilters();

		const redirectPath = startover ? `${path}?${STARTOVER_QUERY_PARAM}` : path;

		if (isAppWebView(location)) {
			const watchPath = getPathByKey(watchPageKey, config).replace(':id', axisId);
			const appLink = getAppLink(watchPath);

			if (!startover) window.location.href = appLink;
		} else if (isEmbeddedView(location)) {
			window.open(getAppLink(redirectPath));
		} else {
			browserHistory.push(redirectPath);
		}
	};

	showEPGDetailModal = () => {
		const { openModal, closeModal, scheduleItem, sport, icsContent } = this.props;

		const modalProps = {
			icsContent,
			scheduleItem,
			sport,
			closeModal,
			id: EPG_DETAIL_OVERLAY_MODAL_ID,
			onPlayClick: this.onPlayClick
		};
		openModal({
			id: EPG_DETAIL_OVERLAY_MODAL_ID,
			type: ModalTypes.CUSTOM,
			element: <EPGDetailOverlay {...modalProps} />,
			disableAutoClose: true
		});
	};

	render() {
		const { scheduleItem, icsContent } = this.props;
		const { eventName, id, startDate, endDate } = scheduleItem;
		const isFutureEvent = new Date(startDate) > new Date();
		const isPastEvent = new Date() > new Date(endDate);

		const blockClass = bem.b({
			past: isPastEvent,
			'on-now': isOnNow(startDate, endDate),
			future: isFutureEvent
		});

		return (
			<div className={blockClass} key={id} onClick={this.showEPGDetailModal}>
				<GamesEPGItemMetadata scheduleItem={scheduleItem} />
				<h3 className={bem.e('title')}>{eventName}</h3>
				<GamesEPGItemCTA icsContent={icsContent} scheduleItem={scheduleItem} onPlayClick={this.onPlayClick} />
			</div>
		);
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	return {
		config: state.app.config,
		location: state.page.history.location
	};
}

function mapDispatchToProps(dispatch) {
	return {
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

const Component: any = connect<Props, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(GamesEPGItem);
export default Component;
