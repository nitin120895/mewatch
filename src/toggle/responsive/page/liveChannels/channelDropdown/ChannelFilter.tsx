import * as React from 'react';
import * as cx from 'classnames';
import { connect, Dispatch } from 'react-redux';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { Bem } from 'shared/util/styles';
import ChannelFilterList from 'toggle/responsive/page/liveChannels/channelDropdown/ChannelFilterList';
import SVGPathIcon from 'shared/component/SVGPathIcon';

import './ChannelFilter.scss';

type ChannelSelectorPosition = 'left' | 'right';

interface ChannelFilterInternalProps {
	channelData: api.PageEntry[];
	selectedChannel: string;
	position?: ChannelSelectorPosition;
	autoExpand?: boolean;
	updateFilterChannel: (filterChannel: string) => void;
}

interface ChannelFilterDispatchProps {
	sendFilterAnalyticsEvent?: (type: string, value: string) => void;
}

interface ChannelFilterState {
	expanded: boolean;
}

type ChannelFilterProps = ChannelFilterInternalProps & ChannelFilterDispatchProps;

const bem = new Bem('channel-filter');
const dropdownType = 'Channels';

class ChannelFilter extends React.Component<ChannelFilterProps, ChannelFilterState> {
	/* tslint:disable-next-line:no-null-keyword */
	private dropdownListRef: HTMLElement | null = null;
	/* tslint:disable-next-line:no-null-keyword */
	private dropdownSelectorRef: HTMLElement | null = null;
	/* tslint:disable-next-line:no-null-keyword */
	private dropdownButtonRef: HTMLElement | null = null;

	static defaultProps: Partial<ChannelFilterInternalProps> = {
		position: 'right',
		autoExpand: false
	};

	constructor(props) {
		super(props);
		this.state = {
			expanded: false
		};
	}

	private closeChannelList = e => {
		const { expanded } = this.state;
		// This is to prevent event bubbling else it would trigger openChannelList onClick and open the dropdown again.
		if (
			e &&
			(e.target === this.dropdownButtonRef || (this.dropdownButtonRef && this.dropdownButtonRef.contains(e.target))) &&
			expanded
		) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({ expanded: false });
	};

	private openChannelList = () => {
		this.setState({ expanded: true }, this.applyDropdownHeight);
	};

	private applyDropdownHeight = () => {
		/* 
			This function is applying height to the dropdown dynamically to prevent
			it from being cut off when sufficient space is not present at the bottom of the viewport.
			For eg: When we select a Genre which has lesser number of tiles for 
			800px < viewport < 1200px, the dropdown gets cut and makes the UI inconsistent.
			We are calculating the amount of space left at the bottom of the dropdown button by deducting 
			space on top from the full height of the viewport including scroll and setting the max-height accordingly.
		*/
		const { expanded } = this.state;
		if (expanded) {
			const offSet =
				this.dropdownSelectorRef && this.dropdownSelectorRef.offsetTop + this.dropdownSelectorRef.offsetHeight;
			const heightDropdown = document && document.body.scrollHeight - offSet - 20; // extra 20px for padding on the bottom end of viewport
			this.dropdownListRef.style.maxHeight = `${heightDropdown}px`;
		}
	};

	private onFilterChange = (value: string) => {
		const { updateFilterChannel, selectedChannel, sendFilterAnalyticsEvent } = this.props;
		if (value === selectedChannel) return;
		updateFilterChannel(value);
		sendFilterAnalyticsEvent(dropdownType, value);
	};

	render() {
		const { expanded } = this.state;
		const { channelData, position, autoExpand, selectedChannel } = this.props;
		if (!channelData || !channelData.length) {
			/* tslint:disable-next-line:no-null-keyword */
			return null;
		}

		const blockClasses = bem.b(position, {
			expanded: expanded,
			'auto-expand': autoExpand
		});
		const classes = cx(blockClasses, {
			clearfix: position === 'right'
		});

		return (
			<div className="channel-selector-container">
				<div ref={el => (this.dropdownSelectorRef = el)} className={classes}>
					<button
						type="button"
						ref={el => (this.dropdownButtonRef = el)}
						className={bem.e('button', { expanded })}
						onClick={this.openChannelList}
					>
						<span>{selectedChannel}</span>
						<SVGPathIcon
							className={bem.e('arrow-icon')}
							data="M12.885.5L14.5 2.188 7.5 9.5l-7-7.313L2.115.5 7.5 6.125z"
							width="15"
							height="10"
						/>
					</button>
					<div ref={el => (this.dropdownListRef = el)} className={bem.e('list-container')} aria-expanded={expanded}>
						<ChannelFilterList
							channels={channelData}
							selectedChannelName={selectedChannel}
							onSelect={this.onFilterChange}
							closeDropdown={this.closeChannelList}
						/>
					</div>
				</div>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch: Dispatch<any>): any {
	return {
		sendFilterAnalyticsEvent: (type: string, value: string) =>
			dispatch(
				analyticsEvent(AnalyticsEventType.FILTER_REQUEST, {
					filterType: type,
					filterValue: value
				})
			)
	};
}

export default connect<undefined, ChannelFilterDispatchProps, ChannelFilterProps>(
	undefined,
	mapDispatchToProps
)(ChannelFilter);
