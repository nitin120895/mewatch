import * as React from 'react';
import { Dispatch } from 'redux';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import PlayerStandard from '../../../player/PlayerStandard';
import { browserHistory } from 'shared/util/browserHistory';
import {
	ChannelScheduleEntityProps,
	ChannelScheduleProps,
	withChannelSchedule
} from '../../../component/ChannelSchedule';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { toggleChannelSelectorVisibility, toggleStartover } from 'shared/app/playerWorkflow';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import CtaButton from 'ref/responsive/component/CtaButton';
import { noCurrentProgram, noSchedule, resolveChannelLogo } from 'toggle/responsive/util/epg';
import LinearInfoPanel from 'toggle/responsive/pageEntry/channelDetail/components/LinearInfoPanel';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { KEY_CODE } from 'shared/util/keycodes';
import { get } from 'shared/util/objects';
import CastPlayerStandard from 'toggle/responsive/player/cast/CastPlayerStandard';
import { CloseModal, ToggleContent } from 'shared/uiLayer/uiLayerWorkflow';
import { CHANNELS_SELECTOR_ID, UPCOMING_SCHEDULE_SELECTOR_ID } from 'toggle/responsive/util/channelUtil';
import {
	FULLSCREEN_QUERY_PARAM,
	isItemRestricted,
	isAccountAgeValid,
	isStartOverEnabled,
	STARTOVER_QUERY_PARAM
} from 'toggle/responsive/util/playerUtil';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import SubscriptionOverlay from './SubscriptionOverlay';
import { getAllowedToWatchAge } from 'shared/util/itemUtils';

import './LinearPlayer.scss';

const bem = new Bem('live-player');

interface OwnProps extends ChannelScheduleProps {}

interface DispatchProps {
	analyticsEvent: (type, payload) => any;
	toggleStartover: () => void;
	closeModal: (id: string) => void;
	toggleChannelSelectorVisibility: (isVisible: boolean) => void;
	showContent: () => void;
}

interface StoreProps {
	startover: boolean;
	startoverProgram?: api.ItemSchedule;
	isCastActive: boolean;
	isChannelSelectorVisible: boolean;
	useAmPmTimeFormat: boolean;
	activeAccount: boolean;
	classification: api.Classification;
	isPlayerInitialised: boolean;
}

type LinearPlayerProps = OwnProps & DispatchProps & StoreProps & ChannelScheduleEntityProps;

interface LinearPlayerState {
	fullscreen: boolean;
	playerError: boolean;
	signingOut: boolean;
}

class LinearPlayer extends React.Component<LinearPlayerProps, LinearPlayerState> {
	container: HTMLDivElement;

	constructor(props) {
		super(props);

		this.state = {
			fullscreen: fullscreenService.isFullScreen(),
			playerError: false,
			signingOut: false
		};
	}

	componentDidMount = (): void => {
		this.props.showContent();
		document.addEventListener('keyup', this.onKeyUp, false);
		fullscreenService.setFullScreenElement(this.container);
		fullscreenService.setCallback(this.fullscreenCallback);
		if (this.hasError() && window.location.search.includes(FULLSCREEN_QUERY_PARAM)) {
			fullscreenService.switchOnFullscreen();
			this.fixPath();
		}
	};

	componentDidUpdate(prevProps: LinearPlayerProps, prevState: LinearPlayerState) {
		const { analyticsEvent, currentProgram, activeAccount, isPlayerInitialised, item, startover } = this.props;

		// Enter startover mode on load of Linear Player when query param is present in url
		if (window.location.search.includes(STARTOVER_QUERY_PARAM)) {
			const playerSessionLoaded = !prevProps.isPlayerInitialised && isPlayerInitialised;
			const isStartoverProgram = currentProgram && isStartOverEnabled(currentProgram);

			if (playerSessionLoaded && isStartoverProgram) {
				this.onToggleStartoverMode();
				this.fixPath();
			}
		}

		const programIsReady = prevProps.currentProgram && currentProgram;
		const programChanged = programIsReady && prevProps.currentProgram.id !== currentProgram.id;
		const channelChanged = programIsReady && prevProps.currentProgram.channelId !== currentProgram.channelId;

		if (channelChanged) {
			this.setState({ playerError: false });
			// Switch off startover when channel changes
			if (startover) {
				this.onToggleStartoverMode();
			}
		}

		if (isPlayerInitialised && !channelChanged && programChanged) {
			// Fire analytics event when current program changes
			analyticsEvent(AnalyticsEventType.VIDEO_LINEAR_PROGRAM_UPDATED, {
				item: { ...item, scheduleItem: currentProgram },
				startoverInfo: {
					startover
				}
			});
		}

		if (prevProps.activeAccount && !activeAccount) {
			this.setState({ signingOut: true });
		}
		if (this.state.fullscreen !== fullscreenService.isFullScreen()) {
			if (this.container) {
				this.setState({ fullscreen: fullscreenService.isFullScreen() });
			}
		}
		if (window.location.search.includes(FULLSCREEN_QUERY_PARAM)) {
			fullscreenService.switchOnFullscreen();
			this.fixPath();
		}
	}

	componentWillUnmount() {
		if (this.props.startover) this.props.toggleStartover();
		document.removeEventListener('keyup', this.onKeyUp);
		fullscreenService.switchOffFullscreen();
		fullscreenService.removeCallback(this.fullscreenCallback);
	}

	private fullscreenCallback = (): void => {
		this.container && this.setState({ fullscreen: fullscreenService.isFullScreen() });
	};

	onKeyUp = e => {
		const { isChannelSelectorVisible, closeModal, toggleChannelSelectorVisibility } = this.props;

		if (e.keyCode === KEY_CODE.BACKSPACE) {
			fullscreenService.switchOffFullscreen();

			if (isChannelSelectorVisible) {
				toggleChannelSelectorVisibility(false);
				closeModal(CHANNELS_SELECTOR_ID);
				closeModal(UPCOMING_SCHEDULE_SELECTOR_ID);
			}
		}
	};

	fixPath = () => {
		browserHistory.replace(window.location.pathname);
	};

	private toggleFullscreen = (): void => fullscreenService.changeFullscreen();

	render() {
		// tslint:disable-next-line:no-null-keyword
		if (_SSR_) return null;
		const { currentProgram, item, startover, startoverProgram } = this.props;
		const { fullscreen, playerError } = this.state;
		const startOver = item.type === 'channel' && isStartOverEnabled(currentProgram);

		return (
			<div>
				<div className={cx(bem.e('title-container', { fullscreen }), 'grid-margin')}>
					{item.title && <h1 className={bem.e('title')}>{item.title}</h1>}
				</div>
				<div className={bem.b({ fullscreen, startover })} ref={this.onRef}>
					<div
						className={cx(bem.e('player'), { error: this.hasError() || playerError, startOver })}
						onDoubleClick={this.toggleFullscreen}
					>
						{this.renderPlayer()}
					</div>
					{!fullscreen && (
						<LinearInfoPanel
							className={bem.e('info-panel')}
							{...this.props}
							currentProgram={startover && startoverProgram ? startoverProgram : currentProgram}
							hasError={this.hasScheduleError()}
						/>
					)}
				</div>
			</div>
		);
	}

	renderPlayer() {
		const { isCastActive } = this.props;
		const { playerError } = this.state;
		const hasError = this.hasError();

		if (isCastActive) {
			return <CastPlayerStandard {...this.props} onBack={this.onBack} />;
		} else if (!(hasError || playerError)) {
			return (
				<PlayerStandard
					{...this.props}
					container={this.container}
					linear={true}
					onError={this.onError}
					onBack={this.onBackButtonClick}
					onToggleStartoverMode={this.onToggleStartoverMode}
				/>
			);
		} else {
			return this.renderErrorState(playerError);
		}
	}

	onBackButtonClick = () => {
		browserHistory.goBack();
	};

	onToggleStartoverMode = () => {
		this.props.toggleStartover();
	};

	onBack = () => {
		this.setState({ playerError: false });
		fullscreenService.switchOffFullscreen();
		browserHistory.goBack();
	};

	onError = error => {
		this.setState({
			playerError: error
		});
	};

	renderErrorState(error?) {
		const { loading, item, schedules, currentProgram, classification } = this.props;
		const { fullscreen, signingOut, playerError } = this.state;

		let errorContent = undefined;

		const isValidAge = isAccountAgeValid(item);

		if (!canPlay(item)) {
			errorContent = <SubscriptionOverlay item={item} />;
		} else if (!isValidAge && !playerError) {
			const age = getAllowedToWatchAge(item, classification);
			errorContent = (
				<div>
					<IntlFormatter elementType="h4">{'@{restricted_content|Restricted Content}'}</IntlFormatter>
					<IntlFormatter elementType="p" values={{ age }}>
						{'@{restricted_content_age_lower|You must be at least {age} years old to view this content}.}'}
					</IntlFormatter>
				</div>
			);
		}
		if (noCurrentProgram(currentProgram, schedules)) {
			errorContent = (
				<IntlFormatter>
					{'@{epg_noSchedule_description|There is currently no programme showing on this channel.}'}
				</IntlFormatter>
			);
		} else if (noSchedule(schedules)) {
			errorContent = (
				<div>
					<IntlFormatter>
						{'@{epg_noMetadata_description_part1|We are currently experiencing a network issue.}'}
					</IntlFormatter>
					<IntlFormatter>{'@{epg_noMetadata_description_part2|Please try again later.}'}</IntlFormatter>
				</div>
			);
		} else if (error) {
			errorContent = (
				<div>
					{error.title && <IntlFormatter elementType="h4">{error.title}</IntlFormatter>}
					{error.description && <IntlFormatter elementType="p">{error.description}</IntlFormatter>}
					{error.additionalDescription && <IntlFormatter elementType="p">{error.additionalDescription}</IntlFormatter>}
				</div>
			);
		}

		return (
			!loading &&
			!signingOut && (
				<div className={bem.e('error-message')}>
					{!error && isValidAge && <img src={resolveChannelLogo(item)} alt="" />}
					{errorContent}
					{fullscreen && (
						<IntlFormatter
							elementType={CtaButton}
							onClick={this.onBack}
							componentProps={{
								ordinal: 'primary',
								theme: 'light'
							}}
						>
							{'@{app.ok|OK}'}
						</IntlFormatter>
					)}
				</div>
			)
		);
	}

	hasError() {
		const { item } = this.props;
		let isValidateAge = true;

		if (isItemRestricted(item)) {
			isValidateAge = isAccountAgeValid(item);
		}

		return !canPlay(item) || !isValidateAge;
	}

	hasScheduleError() {
		const { currentProgram, schedules } = this.props;
		return noCurrentProgram(currentProgram, schedules) || noSchedule(schedules);
	}

	onRef = ref => {
		this.container = ref;
	};
}

function mapStateToProps({ player, app, account }: state.Root): StoreProps {
	const { connectionStatus } = player.cast;
	const useAmPmTimeFormat = get(app, 'config.linear.useAmPmTimeFormat');
	const classification = get(app, 'config.classification');
	return {
		startover: player.startover,
		startoverProgram: player.startoverProgram,
		isCastActive: connectionStatus === 'Connecting' || connectionStatus === 'Connected',
		isChannelSelectorVisible: player.channelSelectorVisible,
		useAmPmTimeFormat,
		activeAccount: account.active,
		classification,
		isPlayerInitialised: player.isInitialised
	};
}

function mapDispatchToProps(dispatch: Dispatch<any>): DispatchProps {
	return {
		analyticsEvent: (type, payload) => dispatch(analyticsEvent(type, { payload })),
		toggleStartover: () => dispatch(toggleStartover()),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		toggleChannelSelectorVisibility: (isVisible: boolean) => dispatch(toggleChannelSelectorVisibility(isVisible)),
		showContent: () => dispatch(ToggleContent(true))
	};
}

export default connect<StoreProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(withChannelSchedule<{}>()(LinearPlayer) as any);
