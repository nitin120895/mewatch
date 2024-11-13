import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { isAppWebView } from 'shared/page/pageUtil';
import { Bem } from 'shared/util/styles';

import AddToCalendarButtonTooltip from 'toggle/responsive/component/AddToCalendarButton/AddToCalendarButtonTooltip';
import CalanderIcon from './icons/CalendarIcon';
import CtaButton from 'toggle/responsive/component/CtaButton';

import './AddtoCalendarButton.scss';

const bem = new Bem('add-to-calendar');
interface AddToCalendarButtonState {
	isTooltipVisible?: boolean;
}

interface StateProps {
	location?: HistoryLocation;
}

export interface OwnProps {
	className?: string;
	calendarEvent: CalendarEvent;
	isDropdown?: boolean;
}

export type AddToCalendarButtonProps = StateProps & OwnProps;

export interface CalendarEvent {
	title: string;
	description: string;
	startDate: Date;
	endDate?: Date;
	channelLink?: string;
}
class AddToCalendarButton extends React.Component<AddToCalendarButtonProps, AddToCalendarButtonState> {
	private hideTimeout;

	constructor(props) {
		super(props);
		this.state = {
			isTooltipVisible: false
		};
	}

	handleBlur = e => {
		this.hideTimeout = setTimeout(() => {
			this.setState({ isTooltipVisible: false });
		}, 300);
	};

	handleClick = e => {
		clearTimeout(this.hideTimeout);

		e.target.focus();
		e.stopPropagation();

		this.setState(prevState => ({ isTooltipVisible: !prevState.isTooltipVisible }));
	};

	render() {
		/* tslint:disable:no-null-keyword */
		const { className, isDropdown, location } = this.props;
		const { isTooltipVisible } = this.state;
		const ordinal = isDropdown ? 'naked' : 'secondary';
		const isMobileApp = isAppWebView(location);
		return (
			<div
				className={cx(
					bem.b({
						dropdown: isDropdown && isDropdown === true,
						open: isTooltipVisible,
						app: isMobileApp
					}),
					className
				)}
			>
				<CtaButton
					type="button"
					className={bem.e('calendar-btn')}
					ordinal={ordinal}
					onClick={this.handleClick}
					onBlur={this.handleBlur}
				>
					<CalanderIcon className={bem.e('icon')} />
					Add to Calendar
				</CtaButton>
				{isTooltipVisible && (
					<AddToCalendarButtonTooltip calendarEvent={this.props.calendarEvent} isAppWebView={isMobileApp} />
				)}
			</div>
		);
	}
}
function mapStateToProps(state: state.Root, ownProps): any {
	return {
		location: state.page.history.location
	};
}

const Component: any = connect<AddToCalendarButtonProps, any, any>(
	mapStateToProps,
	{}
)(AddToCalendarButton);
export default Component;
