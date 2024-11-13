import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import { Bem } from 'shared/util/styles';
import { filterChange } from 'shared/page/pageWorkflow';
import { isLessThanTabletSize } from 'ref/responsive/util/grid';
import { DropdownSelectName } from 'toggle/responsive/pageEntry/continuous/ContinuousScrollPackshotList';
import './DropSelect.scss';

/**
 * Drop down option
 *
 * @param {string} label Label displayed to the user for a drop down option.
 * 						 This can be human readable or if used in conjunction with useTranslations
 * 						 on the parent drop down will use IntlFormatter to display a localised value
 * @param {string} key Key associated with the drop down option. This will not be directly shown to the user.
 */
export interface DropSelectOption {
	label: string;
	key: string;
}

export enum DropSelectAlignment {
	Right = 'right',
	Left = 'left'
}
interface DropSelectDispatchProps {
	filterChange?: ({ type, value }) => void;
	sendFilterAnalyticsEvent?: (type, value) => void;
}

interface DropSelectStateProps {
	strings?: { [key: string]: string };
}

export interface DropSelectOwnProps {
	name?: string;
	label: string;
	className?: string;
	selectedKey?: string;
	defaultOption?: DropSelectOption;
	options: DropSelectOption[];
	onSelect?: (key: string, name?: string) => void;
	useTranslations?: boolean;
	alignment?: DropSelectAlignment;
}

export interface DropSelectState {
	active?: boolean;
	selectedLabel?: string;
	mobileTargetWidth?: number;
	targetWidth?: number;
	windowWidth?: number;
}
type DropSelectProps = DropSelectStateProps & DropSelectDispatchProps & DropSelectOwnProps;

const bem = new Bem('drop-select');

export const PLACEHOLDER_KEY = '__placeholder';

class DropSelect extends React.Component<DropSelectProps, DropSelectState> {
	private container: HTMLElement;
	private currentOptionElement: HTMLElement;
	private mobileSelectElement: HTMLSelectElement;
	private dropDownWidths: number[];
	private mobileDropDownWidthElement: HTMLElement;
	private dropDownContainer: HTMLElement;

	static defaultProps = {
		useTranslations: false
	};

	constructor(props) {
		super();

		// + 1 for the length to accommodate for the default option
		this.dropDownWidths = [].fill(0, 0, props.options.length + 1);

		this.state = {
			active: false,
			mobileTargetWidth: 0,
			windowWidth: 0,
			selectedLabel: this.getSelectedLabel(props)
		};
	}

	componentDidMount() {
		window.addEventListener('resize', this.onResize);
		document.body.addEventListener('click', this.closeDropDown);
		document.body.addEventListener('touchend', this.closeDropDown);
		const mobileTargetWidth = this.mobileDropDownWidthElement.offsetWidth;
		this.setState({
			mobileTargetWidth,
			windowWidth: window.innerWidth
		});
	}

	componentWillReceiveProps(nextProps: DropSelectProps) {
		const { name, filterChange, selectedKey } = this.props;
		if (nextProps.selectedKey !== selectedKey) {
			filterChange({ type: name, value: this.getSelectedFilterNameAndValue(nextProps) });
			this.setState({
				selectedLabel: this.getSelectedLabel(nextProps)
			});
		}
	}

	componentDidUpdate() {
		this.updateMobileTargetWidth();

		const { mobileTargetWidth } = this.state;
		const dropDownContainerTargetWidth = mobileTargetWidth * 1.05 + 30 + 'px';
		if (
			this.container &&
			!isNaN(mobileTargetWidth) &&
			mobileTargetWidth > 0 &&
			this.container.style.width !== dropDownContainerTargetWidth
		) {
			this.container.style.width = dropDownContainerTargetWidth;
		}
	}

	componentWillUnmount() {
		document.body.removeEventListener('click', this.closeDropDown);
		document.body.removeEventListener('touchend', this.closeDropDown);
		window.removeEventListener('resize', this.onResize);
	}

	private getSelectedLabel(props: DropSelectProps): string {
		const { options, selectedKey, defaultOption } = props;
		const option = selectedKey && selectedKey !== defaultOption.key && options.find(o => o.key === selectedKey);
		return option ? option.label : props.label;
	}
	private getSelectedFilterNameAndValue(props: DropSelectProps): string {
		const { options, selectedKey, defaultOption } = props;
		const { strings } = this.props;
		const option = selectedKey && selectedKey !== defaultOption.key && options.find(o => o.key === selectedKey);
		switch (props.name) {
			case DropdownSelectName.SORTING:
			case DropdownSelectName.RATING:
				return option ? strings[option.label] : strings[props.label];
		}
		return option ? option.label : strings[props.label];
	}

	private updateMobileTargetWidth() {
		const mobileTargetWidth = this.mobileDropDownWidthElement.offsetWidth;
		if (mobileTargetWidth !== this.state.mobileTargetWidth) {
			this.setState({ mobileTargetWidth });
		}
	}

	private onResize = () => {
		window.requestAnimationFrame(() => {
			this.updateMobileTargetWidth();
			this.setState({ windowWidth: window.innerWidth });
		});
	};

	private onSelect = (option: DropSelectOption) => {
		const { name, strings, onSelect, sendFilterAnalyticsEvent } = this.props;

		this.closeDropDown();
		onSelect(option.key, name);

		const value = strings[option.label] || option.label;
		sendFilterAnalyticsEvent(name, value);
	};

	private openDropDown = () => {
		const dropDownContainerWidth = this.state.targetWidth * 2 + 'px';
		if (this.dropDownContainer && this.dropDownContainer.style.width !== dropDownContainerWidth) {
			this.dropDownContainer.style.width = dropDownContainerWidth;
		}

		this.setState({ active: true });
	};

	private closeDropDown = (event?) => {
		// preventing propagation of the event is required if the user clicks a currently open drop
		// down. if this is not done the drop down will close and then immediately open again
		// resulting in a perceived "nothing happened when I clicked the drop down"
		if (
			event &&
			(event.target === this.currentOptionElement ||
				(this.currentOptionElement && this.currentOptionElement.contains(event.target))) &&
			this.state.active
		) {
			event.preventDefault();
			event.stopPropagation();
		}

		this.setState({ active: false });
	};

	private onDropDownClick = event => {
		if (event) {
			event.stopPropagation();
		}

		if (this.state.active) {
			this.closeDropDown(event);
		} else {
			this.openDropDown();
		}
	};

	private onMobileSelectChange = () => {
		const { onSelect, defaultOption, name } = this.props;
		const opt = this.mobileSelectElement && this.mobileSelectElement.selectedOptions.item(0);
		onSelect(opt && opt.value !== defaultOption.key ? opt.value : PLACEHOLDER_KEY, name);
		this.updateMobileTargetWidth();
	};

	/**
	 * Update the width of the drop down items based on the widest drop down item
	 *
	 * @param index
	 * @param width
	 */
	private updateDropDownWidth = (index: number, width: number) => {
		this.dropDownWidths[index] = width;

		// .slice() creates a duplicate of the array, which means we don't get
		// [ NUMBER, undefined, undefined .... ]
		const targetWidth = this.dropDownWidths
			.slice()
			.sort(function(a, b) {
				return b - a;
			})
			.shift();

		this.setState({ targetWidth });
	};

	private onMobileSelectRef = (ref: HTMLSelectElement) => {
		this.mobileSelectElement = ref;
	};

	private onMobileWidthFinderRef = (ref: HTMLElement) => {
		this.mobileDropDownWidthElement = ref;
	};

	private onCurrentOptionRef = (ref: HTMLElement) => {
		this.currentOptionElement = ref;
	};

	private onOptionsContainerRef = (ref: HTMLElement) => {
		this.dropDownContainer = ref;
	};

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	render() {
		const { className } = this.props;
		return (
			<div ref={this.onContainerRef} className={cx(bem.b(), className)}>
				{this.renderMobileSelect()}
				{this.renderDesktopDropDown()}
			</div>
		);
	}

	private renderMobileSelect() {
		const { name, options, defaultOption, selectedKey } = this.props;
		const hasDefault = !!defaultOption;

		/*
		Of special note are the options output as a result of renderMobileSelectPlaceholderOption
		and the call to renderMobileSelectOption below it.
		This uses a quirk of the select element where the first option with the set value is
		shown within the rendered select element.
		This allows us to show two different labels:
		1. one within the select element when it is not being interacted with
		2. one within the visible option element which is rendered when the user interacts with
		   the select element to show the drop down box
		The net result of this is that we're able to show two different labels for the same value
		depending on the context of how the user is interacting with the select.
		The user will either see the purpose of the drop down labeled with the `label` prop if the
		select is not focused and the default option is selected or given an option to unset the
		select when the select is focused.
		Safari is a special case in that they still show both options. This is why disabled has been
		included. This has been rationalised in that the user is given context to the options that
		are within the set of options available.
		*/

		return [
			this.renderWidthFinder(),
			<select
				className={bem.e('mobile-drop-down')}
				ref={this.onMobileSelectRef}
				key="mobile-drop-down"
				name={name}
				value={selectedKey || PLACEHOLDER_KEY}
				onChange={this.onMobileSelectChange}
			>
				{hasDefault && [
					this.renderMobileSelectPlaceholderOption(),
					this.renderMobileSelectOption(defaultOption, 'default-visible')
				]}
				{options.map(this.renderMobileSelectOption)}
			</select>
		];
	}

	private renderWidthFinder = () => {
		const { selectedLabel } = this.state;
		const { useTranslations, label } = this.props;
		let widthFinder = (
			<span ref={this.onMobileWidthFinderRef} className={bem.e('drop-down-width-finder')} key="drop-down-width-finder">
				{selectedLabel}
			</span>
		);

		if (useTranslations || selectedLabel === label) {
			widthFinder = (
				<span
					ref={this.onMobileWidthFinderRef}
					className={bem.e('drop-down-width-finder')}
					key="drop-down-width-finder"
				>
					<IntlFormatter>{`@{${selectedLabel}}`}</IntlFormatter>
				</span>
			);
		}

		return widthFinder;
	};

	private renderMobileSelectOption = (option, key) => {
		const { useTranslations, label } = this.props;

		let optionElement = (
			<option value={option.key} key={key || option.key} data-label={option.label}>
				{option.label}
			</option>
		);

		if (useTranslations || option.label === label) {
			optionElement = (
				<IntlFormatter elementType="option" value={option.key} key={key || option.key} data-label={option.label}>
					{`@{${option.label}}`}
				</IntlFormatter>
			);
		}

		return optionElement;
	};

	private renderMobileSelectPlaceholderOption = () => {
		const { label } = this.props;

		return (
			<IntlFormatter elementType="option" value={PLACEHOLDER_KEY} key="default-hidden" hidden disabled>
				{`@{${label}}`}
			</IntlFormatter>
		);
	};

	private renderDesktopDropDown() {
		const { options, defaultOption, useTranslations, label, alignment } = this.props;
		const { active, selectedLabel } = this.state;
		const hasDefault = !!defaultOption;

		let labelElement = <label>{selectedLabel}</label>;

		if (useTranslations || selectedLabel === label) {
			labelElement = <IntlFormatter elementType="label">{`@{${selectedLabel}}`}</IntlFormatter>;
		}

		return (
			<div className={bem.e('options', { mobile: isLessThanTabletSize() }, alignment && `alignment-${alignment}`)}>
				<div
					className={bem.e('current-option', { active })}
					onClick={this.onDropDownClick}
					ref={this.onCurrentOptionRef}
				>
					{labelElement}
					<SVGPathIcon
						className={bem.e('arrow-icon')}
						data="M12.885.5L14.5 2.188 7.5 9.5l-7-7.313L2.115.5 7.5 6.125z"
						width="15"
						height="10"
					/>
				</div>
				<div
					className={cx(bem.e('options-drop-down', { active }), 'clearfix')}
					ref={this.onOptionsContainerRef}
					role="listbox"
				>
					{hasDefault && this.renderOption(defaultOption, 0)}
					{options.map(this.renderOption)}
				</div>
			</div>
		);
	}

	private renderOption = (option: DropSelectOption, index: number) => {
		const { defaultOption, selectedKey, useTranslations } = this.props;
		const { targetWidth, windowWidth } = this.state;
		const hasDefault = !!defaultOption;
		const isDefault = hasDefault && option.key === defaultOption.key;
		const selected = (!selectedKey && isDefault) || (selectedKey && option.key === selectedKey);
		// offset all option indicies by 1 if we have a default option
		if (!isDefault && hasDefault) ++index;
		return (
			<DropDownItem
				option={option}
				key={option.key}
				className={bem.e('selected-option', { selected })}
				reportWidth={this.updateDropDownWidth}
				index={index}
				windowWidth={windowWidth}
				targetWidth={targetWidth}
				useTranslations={useTranslations || isDefault}
				onClick={() => this.onSelect(option)}
			/>
		);
	};
}

/**
 * Drop down item element for the laptop+ drop down
 */
class DropDownItem extends React.Component<any, any> {
	private element: HTMLElement;
	private windowWidth: number;

	componentDidMount() {
		this.updateWidth();
	}

	componentWillReceiveProps(newProps) {
		if (newProps.windowWidth === this.windowWidth) return;

		this.windowWidth = newProps.windowWidth;
		if (!isNaN(newProps.targetWidth) && newProps.targetWidth !== 0) {
			this.element.style.width = newProps.targetWidth + 'px';
		}
		this.updateWidth();
	}

	private updateWidth() {
		const { index, reportWidth } = this.props;
		reportWidth(index, this.element.offsetWidth);
	}

	private onRef = element => {
		this.element = element;
	};

	private onTouchEnd = e => {
		// This is a work around for touch devices to stop clicking through to the element below.
		e.preventDefault();
		this.props.onClick();
	};

	render() {
		const { className, option, onClick, useTranslations } = this.props;

		return (
			<div className={cx(bem.e('option'), className)} onClick={onClick} onTouchEnd={this.onTouchEnd} ref={this.onRef}>
				{useTranslations && <IntlFormatter elementType="label">{`@{${option.label}}`}</IntlFormatter>}
				{!useTranslations && <label>{option.label}</label>}
			</div>
		);
	}
}

function mapStateToProps(store: state.Root) {
	return {
		strings: store.app.i18n.strings
	};
}

function mapDispatchToProps(dispatch: Dispatch<any>): DropSelectDispatchProps {
	return {
		filterChange: ({ type, value }) => dispatch(filterChange(type, value)),
		sendFilterAnalyticsEvent: (type, value) =>
			dispatch(
				analyticsEvent(AnalyticsEventType.FILTER_REQUEST, {
					filterType: type,
					filterValue: value
				})
			)
	};
}

export default connect<DropSelectStateProps, DropSelectDispatchProps, DropSelectProps>(
	mapStateToProps,
	mapDispatchToProps
)(DropSelect);
