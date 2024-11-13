import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import FocusCaptureGroup from 'shared/component/FocusCaptureGroup';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { isMobileSize } from 'ref/responsive/util/grid';
import { noop } from 'shared/util/function';

import './Select.scss';

interface SelectProps {
	className?: string;
	autoExpand?: boolean;
	labelValues?: any;
	label?: string;
	options?: React.ReactElement<any>[];
	extendable?: boolean;
	setActiveSelector?: () => void;
	isActive?: boolean;
	defaultLabel?: string;
	displayState?: form.DisplayState;
	mePass?: boolean;
	errorMessage?: string;
	onDropdownExpand?: (isExpanded: boolean) => void;
}

interface SelectState {
	expanded?: boolean;
	isDropdown?: boolean;
	isMobile?: boolean;
}

export const selectBem = new Bem('select');

export default class Select extends React.Component<SelectProps, SelectState> {
	static defaultProps = {
		displayState: 'default',
		autoExpand: true,
		className: '',
		extendable: false,
		mePass: false,
		errorMessage: '@{empty_required_error}',
		onDropdownExpand: noop
	};

	private container: HTMLElement;

	constructor(props) {
		super(props);
		this.state = {
			expanded: false,
			isDropdown: !props.autoExpand
		};
	}

	componentDidMount() {
		window.addEventListener('click', this.handleClickOutside, false);
		if (this.props.autoExpand) {
			window.addEventListener('resize', this.onResize, false);
			this.onResize();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.handleClickOutside);
		if (this.props.autoExpand) {
			window.removeEventListener('resize', this.onResize);
		}
	}

	componentWillReceiveProps(nextProps: SelectProps) {
		if (this.props.isActive && !nextProps.isActive) {
			this.setState({ expanded: false }, () => this.props.onDropdownExpand(false));
		}
	}

	private selectRef = node => {
		this.container = node;
	};

	handleClickOutside = e => {
		if (this.container && !this.container.contains(e.target)) {
			this.setState({
				expanded: false
			});
		}
	};

	private closeOptionsList() {
		this.setState({ expanded: false }, () => this.props.onDropdownExpand(false));
	}

	private toggleOptionsList() {
		this.setState(
			prevState => ({ expanded: !prevState.expanded }),
			() => this.props.onDropdownExpand(this.state.expanded)
		);
	}

	private onResize = () => {
		const isMobile = isMobileSize();
		const { expanded, isDropdown } = this.state;
		if (isMobile === this.state.isMobile) return;

		this.setState({ isMobile });
		if (!isMobile && (!expanded || isDropdown)) {
			// Not mobile size, should auto expand to list
			window.requestAnimationFrame(this.onAutoExpand);
		} else if (isMobile && !isDropdown) {
			// In mobile size, and not dropdown, should close and change to dropdown
			window.requestAnimationFrame(this.onAutoClose);
		}
	};

	private onAutoExpand = () => {
		this.setState({ expanded: true, isDropdown: false }, () => this.props.onDropdownExpand(true));
	};

	private onAutoClose = () => {
		this.setState({ expanded: false, isDropdown: true }, () => this.props.onDropdownExpand(false));
	};

	private onEscape = () => {
		this.closeOptionsList();
	};

	private onClick = e => {
		if (this.state.expanded) this.closeOptionsList();
	};

	private onButtonClick = e => {
		e.stopPropagation();
		const { setActiveSelector } = this.props;
		if (setActiveSelector) {
			setActiveSelector();
		}
		this.toggleOptionsList();
	};

	private renderErrorMessage(message: string) {
		const { displayState, mePass } = this.props;
		if (mePass && displayState === 'error') {
			return (
				<IntlFormatter elementType="label" className={selectBem.e('label')} aria-hidden={true}>
					{message}
				</IntlFormatter>
			);
		}
	}

	private renderTransitiveLabel(isDropdownExpanded, valueSelected) {
		const { displayState, defaultLabel, mePass } = this.props;
		const error = displayState === 'error';
		const expanded = isDropdownExpanded && (valueSelected || error);
		const expandedNotError = isDropdownExpanded && !error && !valueSelected;

		if (mePass && (expanded || expandedNotError)) {
			return (
				<IntlFormatter elementType="label" className={selectBem.e('trans-label')} aria-hidden={true}>
					{defaultLabel}
				</IntlFormatter>
			);
		}
	}

	render() {
		const {
			autoExpand,
			className,
			extendable,
			mePass,
			defaultLabel,
			label,
			labelValues,
			displayState,
			errorMessage
		} = this.props;
		const { expanded, isDropdown } = this.state;
		const isDropdownExpanded = expanded && isDropdown;
		const valueSelected = defaultLabel && defaultLabel !== label;

		const blockClasses: string = cx(
			selectBem.b({
				expanded: isDropdownExpanded,
				'drop-down': isDropdown,
				'auto-expand': autoExpand,
				extendable: extendable,
				'me-pass': mePass,
				'value-selected': valueSelected,
				[displayState]: true
			}),
			className
		);

		return (
			<div className={blockClasses} onClick={this.onClick} ref={this.selectRef}>
				<FocusCaptureGroup focusable={isDropdownExpanded} onEscape={this.onEscape}>
					{this.renderTransitiveLabel(isDropdownExpanded, valueSelected)}
					<IntlFormatter
						elementType="button"
						type="button"
						className={selectBem.e('button')}
						onClick={this.onButtonClick}
						aria-haspopup="true"
						aria-controls="episodeSortingContainer"
						aria-expanded={expanded}
					>
						<IntlFormatter values={labelValues}>{label}</IntlFormatter>
					</IntlFormatter>
					<div id="episodeSortingContainer" className={selectBem.e('list-container')} aria-expanded={expanded}>
						<ul className={selectBem.b('list')}>{this.props.options}</ul>
					</div>
				</FocusCaptureGroup>
				{this.renderErrorMessage(errorMessage)}
			</div>
		);
	}
}
