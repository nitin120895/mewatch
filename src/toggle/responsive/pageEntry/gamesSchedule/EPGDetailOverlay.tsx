import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CloseIcon from '../../component/modal/CloseIcon';
import { GamesEPGItem } from 'shared/linear/gamesSchedule';

import GamesEPGItemCTA from 'toggle/responsive/pageEntry/gamesSchedule/GamesEPGItemCTA';
import GamesEPGItemMetadata from './GamesEPGItemMetadata';

import './EPGDetailOverlay.scss';

interface EPGDetailOverlayProps {
	scheduleItem: GamesEPGItem;
	sport: any;
	id: string;
	icsContent?: any;
	closeModal: (id: string) => void;
	onPlayClick: (e) => void;
}

const bem = new Bem('epg-detail-overlay');

export default class EPGDetailOverlay extends React.Component<EPGDetailOverlayProps, any> {
	private overlayContainer: HTMLElement;

	setOverlayContainer = ref => {
		this.overlayContainer = ref;
	};

	onOverlayClose = e => {
		if (e.target !== this.overlayContainer) return;
		this.onClose();
	};

	onClose = () => {
		const { closeModal, id } = this.props;
		closeModal(id);
	};

	renderContent() {
		const { onPlayClick, scheduleItem, sport, icsContent } = this.props;
		const { title, thumbnail } = sport;
		const { channelName, eventName, syp } = this.props.scheduleItem;

		return (
			<div className={bem.e('content')}>
				<div className={bem.e('header')}>
					<div className={bem.e('sport')}>
						<div className={bem.e('sport-logo')}>
							<img src={thumbnail} alt={title} />
						</div>
						<span className={bem.e('sport-title')}>{title}</span>
					</div>
					<h4 className={bem.e('channel')}>{channelName}</h4>
				</div>
				<div className={bem.e('scrollable-content')}>
					<h3 className={bem.e('title')}>{eventName}</h3>
					<GamesEPGItemMetadata className={bem.e('metadata')} showDate={true} scheduleItem={scheduleItem} />
					<div className={bem.e('synopsis')}>{syp}</div>
					<GamesEPGItemCTA
						className={bem.e('cta')}
						icsContent={icsContent}
						scheduleItem={scheduleItem}
						onPlayClick={onPlayClick}
					/>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className={bem.b()} onClick={this.onOverlayClose} ref={this.setOverlayContainer}>
				<div className={bem.e('modal')}>
					<div className={bem.e('close')} onClick={this.onClose}>
						<CloseIcon />
					</div>
					{this.renderContent()}
				</div>
			</div>
		);
	}
}
