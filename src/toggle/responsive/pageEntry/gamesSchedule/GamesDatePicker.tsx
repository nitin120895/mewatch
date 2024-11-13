import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { isTablet } from 'toggle/responsive/util/grid';
import OverlayDropdown, { OverlayDropdownOwnProps } from 'toggle/responsive/component/modal/OverlayDropdown';
import DatePickerDropdown from 'toggle/responsive/pageEntry/epg/datepicker/DatePickerDropdown';
import TickIcon from 'toggle/responsive/component/modal/TickIcon';
import { getGameEPGDates, getGameEPGDateIndex, formatDateGamesEPG, isDateEqual } from 'shared/util/dates';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';

import './GamesDatePicker.scss';

export const EPG_DATEPICKER_DROPDOWN_LABEL = 'gamesDropdownEPG';

const bem = new Bem('games-date-picker');

interface GamesDatePickerOwnProps extends React.Props<any> {
	date: Date;
	startDate: Date;
	endDate: Date;
	onDateChange: (date: Date) => void;
	toggleDatePicker?: () => void;
}

interface GamesDatePickerStateProps {
	isModalOpen?: boolean;
}

interface GamesDatePickerState {
	currentDateIndex?: number;
	dates: Date[];
	isDropdownOpen: boolean;
}

interface GamesDatePickerDispatchProps extends ModalManagerDispatchProps {
	showDatePickerDropdownModal: (modal: ModalConfig) => void;
}

type GamesDatePickerProps = GamesDatePickerOwnProps & GamesDatePickerDispatchProps & GamesDatePickerStateProps;

class GamesDatePicker extends React.Component<GamesDatePickerProps, GamesDatePickerState> {
	datePickerRef: HTMLElement;
	datePickerDropdownRef: HTMLElement;

	constructor(props: GamesDatePickerProps) {
		super(props);

		const { date, startDate, endDate } = props;
		this.state = {
			currentDateIndex: getGameEPGDateIndex(startDate, endDate, date),
			dates: getGameEPGDates(startDate, endDate),
			isDropdownOpen: false
		};
	}

	componentDidMount() {
		document.body.addEventListener('click', this.closeDropdown);
		document.body.addEventListener('touchend', this.closeDropdown);
	}

	componentWillUnmount() {
		if (this.props.isModalOpen && this.props.closeModal) this.props.closeModal(EPG_DATEPICKER_DROPDOWN_LABEL);
		document.body.removeEventListener('click', this.closeDropdown);
		document.body.removeEventListener('touchend', this.closeDropdown);
	}

	private onDatePickerDropdownChange = option => {
		const selectedOption = option.value;
		this.props.onDateChange(selectedOption);
		this.setState({ currentDateIndex: option.id, isDropdownOpen: false });
	};

	private getDatePickerRef = (ref: HTMLElement) => {
		this.datePickerRef = ref;
	};

	private getDatePickerDropdownRef = (ref: HTMLElement) => {
		this.datePickerDropdownRef = ref;
	};

	renderDesktopDropdown() {
		const dropdownOptions = this.getDropdownOptions();
		const { date: selectedOption } = this.props;
		const { isDropdownOpen } = this.state;
		return (
			<div className={cx(bem.e('desktop-dropdown'), { open: isDropdownOpen })} ref={this.getDatePickerDropdownRef}>
				{dropdownOptions.map(option => {
					const { id, label, value } = option;
					const isSelectedOption = isDateEqual(selectedOption, value);
					return (
						<div
							key={id}
							className={cx(bem.e('dropdown-option'), { selected: isSelectedOption })}
							onClick={() => {
								this.onDatePickerDropdownChange(option);
							}}
						>
							<IntlFormatter>{label}</IntlFormatter>
							{isSelectedOption && <TickIcon />}
						</div>
					);
				})}
			</div>
		);
	}

	render() {
		const { date } = this.props;
		const { isDropdownOpen } = this.state;
		return (
			<div className={cx(bem.b(`${isDropdownOpen ? 'open' : ''}`), 'date-picker')} ref={this.getDatePickerRef}>
				<DatePickerDropdown onClick={this.openDropdownDatePicker} selectedOption={date} />
				{this.renderDesktopDropdown()}
			</div>
		);
	}

	private getDropdownOptions = () => {
		const options = this.state.dates.map((date, index) => {
			const dateLabel = formatDateGamesEPG(date);
			return {
				label: dateLabel,
				value: date,
				id: index
			};
		});

		return options;
	};
	private closeDropdown = event => {
		if (
			event &&
			(event.target === this.datePickerRef || (this.datePickerRef && this.datePickerRef.contains(event.target))) &&
			this.state.isDropdownOpen
		)
			return;

		this.setState({ isDropdownOpen: false });
	};
	private openDropdownDatePicker = e => {
		const { isModalOpen, closeModal, toggleDatePicker } = this.props;
		if (toggleDatePicker) toggleDatePicker();

		// if mobile/tablet view
		if (isTablet()) {
			if (!isModalOpen) {
				const props: OverlayDropdownOwnProps = {
					id: EPG_DATEPICKER_DROPDOWN_LABEL,
					options: this.getDropdownOptions(),
					value: this.state.currentDateIndex,
					onChange: this.onDatePickerDropdownChange,
					scrollToCurrentOption: true,
					title: '@{games_schedule_date_selection_title}'
				};

				this.props.showDatePickerDropdownModal({
					id: EPG_DATEPICKER_DROPDOWN_LABEL,
					type: ModalTypes.CUSTOM,
					target: 'app',
					element: <OverlayDropdown {...props} />,
					componentProps: {
						className: EPG_DATEPICKER_DROPDOWN_LABEL
					},
					disableAutoClose: true
				});
			} else {
				closeModal(EPG_DATEPICKER_DROPDOWN_LABEL);
			}
		} else {
			const { isDropdownOpen, currentDateIndex } = this.state;
			this.setState({ isDropdownOpen: !isDropdownOpen }, () => {
				this.datePickerDropdownRef.scrollTop =
					currentDateIndex * this.datePickerDropdownRef.firstElementChild.clientHeight;
			});
		}
	};
}

function mapStateToProps(state: state.Root) {
	const modals =
		state.uiLayer &&
		state.uiLayer.modals.app.filter(
			modal => typeof modal.id === 'string' && modal.id.includes(EPG_DATEPICKER_DROPDOWN_LABEL)
		);

	return {
		isModalOpen: modals && modals.length > 0
	};
}

function mapDispatchToProps(dispatch) {
	return {
		showDatePickerDropdownModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

export default connect<{}, GamesDatePickerDispatchProps, GamesDatePickerOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(GamesDatePicker);
