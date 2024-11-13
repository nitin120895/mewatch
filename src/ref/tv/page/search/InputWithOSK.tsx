import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import InputSingleLine from 'ref/tv/component/InputSingleLine';
import { SearchInputProps } from './SearchInput';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { waitUntil } from 'ref/tv/util/itemUtils';
import KeysModel from 'shared/util/platforms/keysModel';
import sass from 'ref/tv/util/sass';
import './InputWithOSK.scss';

const maxSearchTermLength = 48;
const id = 'input-with-osk';
const bem = new Bem(id);

type InputWithOSKState = {
	focused: boolean;
	curValue: string;
	showOSK: boolean;
};

export default class InputWithOSK extends React.Component<SearchInputProps, InputWithOSKState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLDivElement;
	private curValue: string;

	constructor(props) {
		super(props);

		this.state = {
			focused: false,
			curValue: props.value,
			showOSK: false
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
		this.context.focusNav.addEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id, e => {
			this.context.focusNav.disableMouseFocus = e;
			this.setState({ showOSK: e });
		});
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
		this.context.focusNav.removeEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id);
	}

	componentWillReceiveProps(nextProps: SearchInputProps) {
		if (this.state.curValue !== nextProps.value) {
			this.setState({ curValue: nextProps.value });
		}
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({ focused: isFocus });

		if (!isFocus) {
			this.setState({ showOSK: false });
			this.props.onInputBlur && this.props.onInputBlur();
		}

		return true;
	};

	private moveLeft = (): boolean => {
		return true;
	};

	private moveRight = (): boolean => {
		return true;
	};

	private moveUp = (): boolean => {
		return false;
	};

	private moveDown = (): boolean => {
		return false;
	};

	private exec = (act?: string) => {
		if (act === 'click') {
			setImmediate(() => {
				this.setState({ showOSK: true });
			});
		} else if (act === 'esc') {
			this.context.focusNav.moveToRow(0);
		}
		return true;
	};

	private onValueChanged = (value: string) => {
		const { onValueChange } = this.props;

		const v = value.trim();

		if (v.length > maxSearchTermLength) return;

		this.curValue = v;
		this.setState({ curValue: v });

		onValueChange && onValueChange(v);
	};

	private focusOnFirstResult = () => {
		setImmediate(() => {
			waitUntil(
				() => {
					return !this.props.loading;
				},
				() => {
					if (this.props.hasResults) {
						this.setState({ showOSK: false });
						this.context.focusNav.move(KeysModel.Down, true);
					}
				}
			);
		});
	};

	render() {
		const { onValueChange } = this.props;
		const { focused, showOSK, curValue } = this.state;
		return (
			<div
				className={bem.b({ focused })}
				ref={ref => (this.ref = ref)}
				onClick={() => {
					this.context.focusNav.moveToRow(1);
				}}
			>
				<InputSingleLine
					useOSK={true}
					focused={focused}
					showOSK={showOSK}
					value={curValue}
					maxLength={maxSearchTermLength}
					placeholder={'search_input_placeholder'}
					className={bem.e('search-osk')}
					valueChanged={this.onValueChanged}
					onBack={() => {
						if (this.state.showOSK) {
							this.setState({ showOSK: false });
							this.focusOnFirstResult();
						} else {
							this.context.focusNav.handelEsc();
						}
					}}
					onDone={() => {
						onValueChange(this.curValue);
						this.setState({ showOSK: false });
						this.focusOnFirstResult();
					}}
				/>
			</div>
		);
	}
}
