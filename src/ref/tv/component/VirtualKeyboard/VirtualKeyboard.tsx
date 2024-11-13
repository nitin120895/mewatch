import * as React from 'react';
import KeyboardKey from './KeyboardKey';
import * as KeyboardLayout from './KeyboardLayout';
import { Focusable } from 'ref/tv/focusableInterface';
import { focusedClass } from 'ref/tv/util/focusUtil';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import './VirtualKeyboard.scss';

const bem = new Bem('VirtualKeyboard');
const bemKey = new Bem('KeyboardKey');

type VirtualKeyboardProps = {
	type?: KeyboardLayout.KeyboardType;
	handleKeyboardInput?: (string) => void;
	defaultFocusedKeyboardKey?: string;
};

type VirtualKeyboardState = Partial<{
	focused: boolean;
	curIndex: number;
	displayUppercased: boolean;
	showSecondaryLayout: boolean;
	keyboardMap: KeyboardLayout.KeyboardMap;
}>;

export class VirtualKeyboard extends React.Component<VirtualKeyboardProps, VirtualKeyboardState> {
	static defaultProps = {
		type: KeyboardLayout.KeyboardType.Alphanumeric
	};

	focusableRow: Focusable;
	private curFocusableMap;
	private currentLayout: Array<KeyboardLayout.KeyboardMapKey>;

	constructor(props) {
		super(props);

		const keyboardMap = this.getKeyboardMap(props.type);

		this.state = {
			...this.state,
			keyboardMap,
			showSecondaryLayout: false,
			displayUppercased: false,
			focused: true,
			curIndex: 1
		};

		this.focusableRow = {
			focusable: true,
			index: 2,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: () => this.move('left'),
			moveRight: () => this.move('right'),
			moveUp: () => this.move('up'),
			moveDown: () => this.move('down'),
			exec: this.exec
		};
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			focused: isFocus
		});
		return true;
	};

	private move(direction: 'left' | 'right' | 'up' | 'down'): boolean {
		const { curIndex } = this.state;
		const tar = this.curFocusableMap && this.curFocusableMap[curIndex];

		if (!tar || tar[direction] === -1) return false;

		this.setState({ curIndex: tar[direction] });
		return true;
	}

	private exec = (act?: string): boolean => {
		const { handleKeyboardInput } = this.props;

		switch (act) {
			case 'click':
				this.onClick(undefined);
				return true;

			case 'del':
				if (handleKeyboardInput) {
					handleKeyboardInput('DEL');
				}

				return true;

			default:
				break;
		}

		return false;
	};

	private onClick = e => {
		const { curIndex } = this.state;
		const { handleKeyboardInput } = this.props;

		const curKey = this.currentLayout[curIndex];

		switch (curKey) {
			case KeyboardLayout.KEY_ABC:
				this.setState({
					keyboardMap: this.getKeyboardMap(KeyboardLayout.KeyboardType.Alphanumeric),
					curIndex: 1
				});
				break;

			case KeyboardLayout.KEY_DEL:
				if (handleKeyboardInput) {
					handleKeyboardInput('DEL');
				}
				break;

			case KeyboardLayout.KEY_NUMERIC:
				this.setState({
					keyboardMap: this.getKeyboardMap(KeyboardLayout.KeyboardType.Numeric),
					curIndex: 2
				});
				break;

			case KeyboardLayout.KEY_PUNC:
				this.setState({
					keyboardMap: this.getKeyboardMap(KeyboardLayout.KeyboardType.Punctuation),
					curIndex: 1
				});
				break;

			case KeyboardLayout.KEY_SPACE:
				if (handleKeyboardInput) {
					handleKeyboardInput(' ');
				}
				break;

			default:
				if (handleKeyboardInput) {
					handleKeyboardInput(curKey);
				}
				break;
		}
	};

	private handleMouseEnter = index => {
		this.setState({ curIndex: index });
	};

	private handleMouseClick = () => {
		this.exec('click');
	};

	toggleUppercased = () => this.setState({ displayUppercased: !this.state.displayUppercased });

	toggleSecondaryLayout = () => this.setState({ showSecondaryLayout: !this.state.showSecondaryLayout });

	getKeyboardMap(keyboardType: KeyboardLayout.KeyboardType): KeyboardLayout.KeyboardMap {
		return KeyboardLayout.keyboardMaps.find(keyboardMap => {
			return keyboardMap.type === keyboardType;
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.type !== this.props.type) {
			const keyboardMap = this.getKeyboardMap(nextProps.type);

			this.setState({
				...this.state,
				keyboardMap: keyboardMap,
				showSecondaryLayout: false,
				displayUppercased: false
			});
		}

		if (nextProps.focused !== undefined && this.state.focused !== nextProps.focused) {
			this.setState({ focused: nextProps.focused });
		}
	}

	renderKeyboardLayout(keyboardLayout, canBeUppercased = false) {
		const { focused, curIndex } = this.state;
		return keyboardLayout.map((keyboardMapKey: KeyboardLayout.KeyboardMapKey, index: number) => {
			const uppercased = this.state.displayUppercased && canBeUppercased;
			const focusedClassName = focused && curIndex === index ? focusedClass : '';

			return (
				<KeyboardKey
					className={cx(bemKey.b(keyboardMapKey, { uppercased }), focusedClassName)}
					key={'key_' + keyboardMapKey}
					index={index}
					onMouseEnter={this.handleMouseEnter}
					onClick={this.handleMouseClick}
				>
					{KeyboardLayout.getKeyValue(keyboardMapKey)}
				</KeyboardKey>
			);
		});
	}

	render() {
		const curKeyboardType = this.state.keyboardMap.type;
		this.currentLayout = this.state.keyboardMap.primaryLayout;

		this.curFocusableMap = KeyboardLayout.getFocusableMap(curKeyboardType);

		const isNumeric = curKeyboardType === KeyboardLayout.KeyboardType.Numeric;
		const isPunctuation = curKeyboardType === KeyboardLayout.KeyboardType.Punctuation;

		const className = bem.b({ isNumeric, isPunctuation });
		return (
			<div className={className}>
				{this.state.keyboardMap.primaryLayout && (
					<div className={className}>{this.renderKeyboardLayout(this.state.keyboardMap.primaryLayout, true)}</div>
				)}
			</div>
		);
	}
}

export default VirtualKeyboard;
