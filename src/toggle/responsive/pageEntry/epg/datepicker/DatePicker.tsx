import * as React from 'react';
import OverlayDropdown, { OverlayDropdownOwnProps } from '../../../component/modal/OverlayDropdown';
import { connect } from 'react-redux';
import DatePickerDropdown from './DatePickerDropdown';
import DateCarousel from './DateCarousel';
import { getEPGDates, getEPGDateIndex, formatDateEPG } from 'shared/util/dates';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';

export const EPG_DATEPICKER_DROPDOWN_LABEL = 'datepickerDropdownEPG';

interface DatePickerEpgOwnProps extends React.Props<any> {
	date: Date;
	onDateChange: (date: Date) => void;
	toggleDatePicker?: () => void;
}

interface DatePickerEpgStateProps {
	daysToShowBeforeCurrent?: number;
	daysToShowAfterCurrent?: number;
	isModalOpen?: boolean;
}

interface DatePickerEpgState {
	currentDateIndex?: number;
	dates: Date[];
	selectedOption: Date;
}

interface DatePickerEpgDispatchProps extends ModalManagerDispatchProps {
	showDatePickerDropdownModal: (modal: ModalConfig) => void;
}

type DatePickerEpgProps = DatePickerEpgOwnProps & DatePickerEpgDispatchProps & DatePickerEpgStateProps;

class DatePicker extends React.Component<DatePickerEpgProps, DatePickerEpgState> {
	datePickerRef: HTMLElement;

	constructor(props: DatePickerEpgProps) {
		super(props);

		const { date, daysToShowBeforeCurrent, daysToShowAfterCurrent } = props;
		this.state = {
			currentDateIndex: getEPGDateIndex(daysToShowBeforeCurrent, daysToShowAfterCurrent, date),
			dates: getEPGDates(daysToShowBeforeCurrent, daysToShowAfterCurrent),
			selectedOption: date
		};
	}

	componentWillUnmount() {
		if (this.props.isModalOpen && this.props.closeModal) this.props.closeModal(EPG_DATEPICKER_DROPDOWN_LABEL);
	}

	private onDatePickerDropdownChange = option => {
		const selectedOption = option.value;
		this.props.onDateChange(selectedOption);
		this.setState({ currentDateIndex: option.id, selectedOption });
	};

	private onDateCarouselChange = (date, index) => {
		this.props.onDateChange(date);
		this.setState({ currentDateIndex: index, selectedOption: date });
	};

	private getDatePickerRef = (ref: HTMLElement) => {
		this.datePickerRef = ref;
	};

	render() {
		const { dates, selectedOption, currentDateIndex } = this.state;

		return (
			<div className="date-picker" ref={this.getDatePickerRef}>
				<DatePickerDropdown onClick={this.openDropdownDatePicker} selectedOption={selectedOption} />
				<DateCarousel currentDateIndex={currentDateIndex} dates={dates} onChange={this.onDateCarouselChange} />
			</div>
		);
	}

	private getDropdownOptions = () => {
		const options = this.state.dates.map((date, index) => {
			const dateLabel = formatDateEPG(date);
			return {
				label: dateLabel,
				value: date,
				id: index
			};
		});

		return options;
	};

	private openDropdownDatePicker = () => {
		const { isModalOpen, closeModal, toggleDatePicker } = this.props;
		if (toggleDatePicker) toggleDatePicker();

		if (!isModalOpen) {
			const positionTop = this.datePickerRef && this.datePickerRef.getBoundingClientRect().bottom;

			const props: OverlayDropdownOwnProps = {
				id: EPG_DATEPICKER_DROPDOWN_LABEL,
				options: this.getDropdownOptions(),
				value: this.state.currentDateIndex,
				onChange: this.onDatePickerDropdownChange,
				scrollToCurrentOption: true
			};

			this.props.showDatePickerDropdownModal({
				id: EPG_DATEPICKER_DROPDOWN_LABEL,
				type: ModalTypes.CUSTOM,
				target: 'app',
				element: <OverlayDropdown {...props} />,
				componentProps: {
					className: EPG_DATEPICKER_DROPDOWN_LABEL,
					style: positionTop
				},
				disableAutoClose: true
			});
		} else {
			closeModal(EPG_DATEPICKER_DROPDOWN_LABEL);
		}
	};
}

function mapStateToProps(state: state.Root) {
	const { viewingWindowDaysAfter, viewingWindowDaysBefore } = state.app.config.linear;
	const modals =
		state.uiLayer &&
		state.uiLayer.modals.app.filter(
			modal => typeof modal.id === 'string' && modal.id.includes(EPG_DATEPICKER_DROPDOWN_LABEL)
		);

	return {
		daysToShowAfterCurrent: viewingWindowDaysAfter,
		daysToShowBeforeCurrent: viewingWindowDaysBefore,
		isModalOpen: modals && modals.length > 0
	};
}

function mapDispatchToProps(dispatch) {
	return {
		showDatePickerDropdownModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

export default connect<{}, DatePickerEpgDispatchProps, DatePickerEpgOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(DatePicker);
