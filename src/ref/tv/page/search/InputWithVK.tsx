import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Bem } from 'shared/util/styles';
import SearchIcon from 'ref/tv/component/SearchIcon';
import VirtualKeyboard from 'ref/tv/component/VirtualKeyboard/VirtualKeyboard';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { SearchInputProps } from './SearchInput';
import sass from 'ref/tv/util/sass';
import './InputWithVK.scss';

interface SearchInputState {
	focused?: boolean;
	curValue?: string;
}

const bem = new Bem('input-with-vk');

/**
 * Search input component.
 */
export default class InputWithVK extends React.PureComponent<SearchInputProps, SearchInputState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private inputRef: Focusable;
	private ref;

	constructor(props) {
		super(props);

		this.state = {
			focused: false,
			curValue: ''
		};

		this.focusableRow = {
			focusable: true,
			index: 1,
			height: sass.searchInputHeight,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.focusableRow.ref = this.ref;
		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({ focused: isFocus });
		!isFocus && this.props.onInputBlur && this.props.onInputBlur();
		return true;
	};

	private moveLeft = (): boolean => {
		return this.inputRef && this.inputRef.moveLeft();
	};

	private moveRight = (): boolean => {
		return this.inputRef && this.inputRef.moveRight();
	};

	private moveUp = (): boolean => {
		return this.inputRef && this.inputRef.moveUp();
	};

	private moveDown = (): boolean => {
		return this.inputRef && this.inputRef.moveDown();
	};

	private exec = (act?: string) => {
		return this.inputRef && this.inputRef.exec(act);
	};

	private onRef = ref => {
		this.ref = ref;
	};

	private onInputRef = ref => {
		if (ref && ref.focusableRow) this.inputRef = ref.focusableRow;
	};

	private onInput = val => {
		const { onValueChange, value } = this.props;
		let newValue;
		if (val === 'DEL') {
			if (value.length > 0) {
				newValue = value.substr(0, value.length - 1);
			}
		} else {
			newValue = value + val;
		}

		if (newValue !== value && onValueChange) {
			onValueChange(newValue);
		}
	};

	render() {
		const { className, value } = this.props;
		const { focused } = this.state;

		return (
			<div
				className={bem.b('', { focused })}
				ref={this.onRef}
				onClick={() => {
					this.context.focusNav.moveToRow(1);
				}}
			>
				<div className={cx(bem.b({ 'has-value': !!value }), className, 'content-margin')}>
					<div className={cx(bem.e('background'), 'full-bleed')} />
					<div className={bem.e('form')} role="search">
						<FormattedMessage id="search_input_placeholder">
							{placeholder => (
								<div
									aria-label="Search"
									className={cx(bem.e('input', value ? 'hasText' : ''), 'full-bleed')}
									autoComplete="off"
								>
									<div className={bem.e('placeholder')}>{placeholder}</div>
								</div>
							)}
						</FormattedMessage>
						<div className={bem.e('curValue')}>
							<div className={bem.e('text')}>{value}</div>
							<div className={bem.e('cursor', focused ? 'focused' : '')} />
						</div>
						<div className={bem.e('icons')}>
							<SearchIcon className={bem.e('icon', 'search')} />
						</div>
					</div>
				</div>
				{focused ? (
					<div className={bem.e('keyboard')}>
						<VirtualKeyboard ref={this.onInputRef} handleKeyboardInput={this.onInput} />
					</div>
				) : (
					''
				)}
			</div>
		);
	}
}
