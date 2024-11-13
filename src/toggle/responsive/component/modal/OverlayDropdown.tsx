import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import TickIcon from './TickIcon';
import { isMobilePortrait, isMobileLandscape } from 'toggle/responsive/util/grid';
import CloseIcon from './CloseIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { connect } from 'react-redux';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import { EPG_DATEPICKER_DROPDOWN_LABEL } from 'toggle/responsive/pageEntry/epg/datepicker/DatePicker';
import { toggleBodyClass } from 'toggle/responsive/util/cssUtil';

import './OverlayDropdown.scss';

const bemOverlayDropdown = new Bem('overlay-dropdown');
const OVERLAY_OFFSET_RIGHT = 20;

interface DropdownOption {
	label: string;
	id: string | number;
}
interface DropdownState {
	ref: Element;
	isOverlayOffsetRight: boolean;
}

export interface OverlayDropdownOwnProps {
	id?: string;
	title?: string;
	options: DropdownOption[];
	value: DropdownOption['id'];
	className?: string;
	buttonRef?: Element;
	positionOffsetTop?: number;
	onScrollableChildRef?: any;
	onChange: (option: DropdownOption) => void;
	onClose?: () => void;
	customRenderer?: (option: DropdownOption) => JSX.Element;
	positionTop?: number;
	scrollToCurrentOption?: boolean;
	container?: HTMLElement;
}

type OverlayDropdownProps = OverlayDropdownOwnProps & ModalManagerDispatchProps;

class OverlayDropdown extends React.Component<OverlayDropdownProps, DropdownState> {
	state = { ref: undefined, isOverlayOffsetRight: false };
	initiallySelectedOption: HTMLElement = undefined;

	componentDidMount() {
		const { scrollToCurrentOption } = this.props;
		history.pushState(undefined, undefined, location.href);
		window.addEventListener('popstate', this.dismissModal);
		window.addEventListener('resize', this.onResize);
		this.checkDropdown();
		if (scrollToCurrentOption && this.initiallySelectedOption) this.initiallySelectedOption.scrollIntoView();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		window.removeEventListener('popstate', this.dismissModal);
		history.back();
		this.checkDropdown();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.buttonRef) {
			const isOverlayOffsetRight = this.isOverlayOffsetRight();
			if (prevState.isOverlayOffsetRight !== isOverlayOffsetRight) this.setState({ isOverlayOffsetRight });
		}
	}

	dismissModal = () => {
		if (this.isOverlayFullscreen()) {
			this.onClose();
		}
	};

	isOverlayFullscreen = () => {
		return isMobilePortrait() || isMobileLandscape() || !this.props.buttonRef;
	};

	checkDropdown = () => {
		if (this.props.id === EPG_DATEPICKER_DROPDOWN_LABEL) {
			toggleBodyClass('datepicker-opened');
		}
	};

	isOverlayOffsetRight = () => this.getOverlayWidthInHalf() > this.getOffsetButtonRect();

	getButtonRect = () => {
		const { buttonRef } = this.props;
		return buttonRef.getBoundingClientRect();
	};

	getOffsetButtonRect = () => {
		const buttonRect = this.getButtonRect();
		return this.getContainerRect().width - buttonRect.left - buttonRect.width / 2;
	};

	getContainerRect = () => {
		const { container } = this.props;
		return container.getBoundingClientRect();
	};

	getOverlayWidthInHalf = () => {
		const { ref } = this.state;
		return ref && ref.clientWidth / 2;
	};

	onResize = () => {
		this.forceUpdate();
	};

	onDropdownRef = element => {
		if (!this.state.ref) {
			this.setState({ ref: element });
		}
	};

	onClose = () => {
		const { onClose, closeModal, id } = this.props;
		closeModal(id);
		onClose();
	};

	render() {
		const { className, title, options, positionOffsetTop, positionTop } = this.props;
		const { isOverlayOffsetRight } = this.state;
		const isOverlayFullscreen = this.isOverlayFullscreen();
		let style = {};

		if (!isOverlayFullscreen) {
			const buttonRect = this.getButtonRect();
			const containerRect = this.getContainerRect();

			const bottom = containerRect.height - (buttonRect.top - containerRect.top) + (positionOffsetTop | 0);
			const left = containerRect.width - this.getOffsetButtonRect() - this.getOverlayWidthInHalf();

			style = {
				bottom: `${bottom}px`,
				top: 'auto',
				width: 'auto',
				height: 'auto',
				left: isOverlayOffsetRight ? 'auto' : `${left}px`,
				right: isOverlayOffsetRight ? `${OVERLAY_OFFSET_RIGHT}px` : 'auto'
			};
		}

		if (positionTop) {
			style = {
				marginTop: `${positionTop}px`
			};
		}

		return (
			<div
				ref={this.onDropdownRef}
				className={cx(bemOverlayDropdown.b(), className, { 'full-screen': isOverlayFullscreen })}
				style={style}
			>
				<div className={bemOverlayDropdown.e('title')}>
					<IntlFormatter>{title}</IntlFormatter>
				</div>

				<div ref={this.props.onScrollableChildRef} className={bemOverlayDropdown.e('options')}>
					{options && options.map(this.renderItem)}
				</div>
				<div className={bemOverlayDropdown.e('cancel')} onClick={this.onClose}>
					<CloseIcon /> Cancel
				</div>
			</div>
		);
	}

	renderItem = (option: DropdownOption) => {
		const { customRenderer, value } = this.props;
		const selected = option.id === value;
		const classes = cx({ selected }, bemOverlayDropdown.e('option'));

		return (
			<div
				key={option.id}
				className={classes}
				onClick={() => this.onChange(option)}
				ref={selected && this.onInitiallySelectedOptionRef}
			>
				{customRenderer ? (
					customRenderer(option)
				) : (
					<IntlFormatter tagName="div" className={bemOverlayDropdown.e('option-label')}>
						{option.label}
					</IntlFormatter>
				)}
				{option.id === value && <TickIcon />}
			</div>
		);
	};

	onChange(option: DropdownOption) {
		const { onChange, closeModal, id } = this.props;
		onChange(option);
		closeModal(id);
	}

	private onInitiallySelectedOptionRef = ref => {
		this.initiallySelectedOption = ref;
	};
}

function mapDispatchToProps(dispatch) {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

export default connect<{}, ModalManagerDispatchProps, OverlayDropdownOwnProps>(
	undefined,
	mapDispatchToProps
)(OverlayDropdown);
