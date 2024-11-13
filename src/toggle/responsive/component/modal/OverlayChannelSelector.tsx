import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { ChannelSelectors } from '../../util/channelUtil';
import CloseIcon from './CloseIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import OverlayChannelSelectorItem from './OverlayChannelSelectorItem';
import OverlayUpcomingScheduleItem from './OverlayUpcomingScheduleItem';
import ScheduleError from '../../pageEntry/channelDetail/components/ScheduleError';
import { isPortrait, isMobileLandscape } from 'ref/responsive/util/grid';
import { isMobile, isTouch } from 'shared/util/browser';
import { toggleChannelSelectorVisibility } from 'shared/app/playerWorkflow';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { get } from 'shared/util/objects';
import { selectSchedules } from 'shared/app/store/scheduleSelectors';
import VerticalScrollbar from '../VerticalScrollbar';

import './OverlayChannelSelector.scss';

export const bem = new Bem('overlay-channel-selector');

export interface OverlayChannelSelectorOwnProps {
	id: string;
	currentProgram: api.ItemSchedule;
	list: api.ItemList;
	className?: string;
	toggleOnNowOverlay: () => void;
	type: string;
}

interface OverlayChannelSelectorStateProps {
	account: state.Account;
	schedules: api.ItemSchedule[];
	scheduleLimit?: number;
	useAmPmTimeFormat: boolean;
}

interface OverlayChannelSelectorDispatchProps extends ModalManagerDispatchProps {
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	toggleChannelSelectorVisibility: (isVisible: boolean) => void;
}

type OverlayChannelSelectorProps = OverlayChannelSelectorOwnProps &
	OverlayChannelSelectorStateProps &
	OverlayChannelSelectorDispatchProps;

interface OverlayChannelSelectorState {
	ref: Element;
	selected: api.ItemSummary;
	fullscreen: boolean;
	isMobileLandscape: boolean;
}

class OverlayChannelSelector extends React.Component<OverlayChannelSelectorProps, OverlayChannelSelectorState> {
	currentChannelRef: HTMLElement;
	scrollContainerRef: HTMLElement;

	constructor(props) {
		super();
		const { list, currentProgram } = props;
		this.state = {
			ref: undefined,
			selected: list.items && list.items.find(item => item.id === currentProgram.channelId),
			fullscreen: fullscreenService.isFullScreen(),
			isMobileLandscape: false
		};
	}

	private fullscreenCallback = (): void => {
		const fullscreen = fullscreenService.isFullScreen();
		!fullscreen && this.props.toggleChannelSelectorVisibility(false);
		this.setState({ fullscreen });
	};

	componentDidMount() {
		this.checkOrientation();
		fullscreenService.setCallback(this.fullscreenCallback);
		window.addEventListener('resize', this.onResize);
	}

	componentWillUnmount() {
		this.onCloseBtnClick();
		window.removeEventListener('resize', this.onResize);
		fullscreenService.removeCallback(this.fullscreenCallback);
	}

	onResize = () => {
		this.checkOrientation();
	};

	onOverlayChannelSelectorRef = element => {
		if (!this.state.ref) {
			this.setState({ ref: element });
		}
	};

	onScrollableContinerRef = element => {
		if (!this.scrollContainerRef) {
			this.scrollContainerRef = element;
			this.scrollToCurrentItem();
		}
	};

	scrollToCurrentItem = () => {
		this.scrollToItem(this.currentChannelRef);
	};

	checkOrientation = () => {
		this.setState({ isMobileLandscape: isMobileLandscape() });
	};

	scrollToItem = item => {
		if (this.scrollContainerRef && item) {
			const { top, height } = item.getBoundingClientRect();
			const scrollContainer = this.scrollContainerRef.getBoundingClientRect();
			if (isMobile() && !isPortrait()) this.scrollContainerRef.scrollTop = top - height / 2;
			else this.scrollContainerRef.scrollTop = top - scrollContainer.top - height / 2;
		}
	};

	onCurrentChannelRef = el => {
		if (!this.currentChannelRef) {
			this.currentChannelRef = findDOMNode<HTMLElement>(el);
		}
	};

	onCloseBtnClick = () => {
		const { toggleChannelSelectorVisibility } = this.props;
		toggleChannelSelectorVisibility(false);
		this.onClose();
	};

	onClose = () => {
		const { closeModal, id } = this.props;
		closeModal(id);
	};

	setSelected = (item: api.ItemSummary, elem: HTMLElement) => {
		this.setState({ selected: item });
		this.scrollToItem(elem);
	};

	render() {
		const { type } = this.props;
		const { fullscreen } = this.state;
		const onNowChannelSelector = type === ChannelSelectors.ON_NOW;

		if (!fullscreen) return <div />;

		return onNowChannelSelector ? this.renderOnNowSelector() : this.renderUpcomingScheduleSelector();
	}

	renderOnNowSelector() {
		const { className, type } = this.props;
		const { isMobileLandscape } = this.state;
		return (
			<div
				ref={this.onOverlayChannelSelectorRef}
				className={cx(bem.b({ landscape: isMobileLandscape }), type, className)}
			>
				<div className={bem.e('title')}>
					<IntlFormatter>{'@{xchd1_title|On Now}'}</IntlFormatter>
					<div className={bem.e('cancel', { top: true })} onClick={this.onCloseBtnClick}>
						<CloseIcon />
					</div>
				</div>
				{this.renderChannels()}
			</div>
		);
	}

	renderUpcomingScheduleSelector() {
		const { className, type } = this.props;
		const { isMobileLandscape, selected } = this.state;
		return (
			<div
				ref={this.onOverlayChannelSelectorRef}
				className={cx(bem.b({ landscape: isMobileLandscape }), type, className)}
			>
				<div className={bem.e('title')}>
					{selected && <IntlFormatter>{selected.title}</IntlFormatter>}
					<div className={bem.e('cancel', { top: true })} onClick={this.onCloseBtnClick}>
						<CloseIcon />
					</div>
				</div>
				{this.renderSchedule()}
			</div>
		);
	}

	renderSchedule() {
		const { list, schedules, scheduleLimit } = this.props;
		const error = !get(list, 'items.length');
		const itemLimit = scheduleLimit || schedules.length;
		// Remove duplicates based on id
		let uniqueArray = [];
		schedules.forEach(function(item) {
			let i = uniqueArray.findIndex(x => x.id === item.id);
			if (i <= -1) {
				uniqueArray.push(item);
			}
		});

		return (
			<div className={cx(bem.e('schedule'), { error })}>
				{!error ? uniqueArray.slice(0, itemLimit).map(this.renderScheduleItem) : <ScheduleError />}
			</div>
		);
	}

	renderScheduleItem = (schedule: api.ItemSchedule) => {
		return (
			<OverlayUpcomingScheduleItem
				key={schedule.id}
				schedule={schedule}
				isMobileLandscape={this.state.isMobileLandscape}
				useAmPmTimeFormat={this.props.useAmPmTimeFormat}
			/>
		);
	};

	renderChannels() {
		const { list } = this.props;
		const error = !get(list, 'items.length');
		if (error || isTouch()) {
			return (
				<div className={cx(bem.e('channels'), { error, touchable: isTouch() })}>
					{error && <ScheduleError />}
					{isTouch() && (
						<div ref={this.onScrollableContinerRef} className={bem.e('channels')}>
							{list.items.map(this.renderChannel)}
						</div>
					)}
				</div>
			);
		}

		const currentIndex = list.items.indexOf(this.state.selected) || 0;

		return (
			<VerticalScrollbar className={bem.e('channels')} length={list.items.length} currentIndex={currentIndex}>
				{list.items.map(this.renderChannel)}
			</VerticalScrollbar>
		);
	}

	private renderChannel = (channel: api.ItemSummary, key: number) => {
		const { account, showModal, toggleOnNowOverlay } = this.props;
		const { selected: selectedItem, isMobileLandscape } = this.state;
		const selected = channel && selectedItem && channel.id === selectedItem.id;

		return (
			<OverlayChannelSelectorItem
				ref={el => {
					if (selected) this.onCurrentChannelRef(el);
				}}
				toggleOnNowOverlay={toggleOnNowOverlay}
				key={channel.id}
				item={channel}
				selected={selected}
				onClose={this.onClose}
				onItemClick={this.setSelected}
				account={account}
				showModal={showModal}
				isMobileLandscape={isMobileLandscape}
			/>
		);
	};
}

function mapStateToProps(state: state.Root, ownProps: OverlayChannelSelectorOwnProps): any {
	return {
		account: state.account,
		schedules: selectSchedules(state, ownProps.currentProgram.channelId),
		scheduleLimit: get(state, 'app.config.linear.upcomingScheduleLimit'),
		useAmPmTimeFormat: get(state, 'app.config.linear.useAmPmTimeFormat')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		toggleChannelSelectorVisibility: (isVisible: boolean) => dispatch(toggleChannelSelectorVisibility(isVisible))
	};
}

export default connect<
	OverlayChannelSelectorStateProps,
	OverlayChannelSelectorDispatchProps,
	OverlayChannelSelectorOwnProps
>(
	mapStateToProps,
	mapDispatchToProps
)(OverlayChannelSelector);
