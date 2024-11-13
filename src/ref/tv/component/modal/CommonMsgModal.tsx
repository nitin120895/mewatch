import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import CtaButton from '../CtaButton';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { stopMove, focusedClass } from 'ref/tv/util/focusUtil';
import IntlFormatter from '../IntlFormatter';
import './CommonMsgModal.scss';

const bem = new Bem('signIn-modal');
const logoImg = require('../../../../../resource/ref/tv/image/axis-logo.png');

type CommonMsgModalProps = Partial<{
	title: string;
	text: string;

	buttons: string[];

	hideRegisterButton: boolean;

	focused: boolean;
	curIndex: number;
	blackBackground: boolean;
	transparent: boolean;

	captureFocus: boolean;
	onClick: (index: number) => void;
	onClose: (ret: boolean) => void;
	noCancel: boolean;
}>;

type CommonMsgModalState = {
	curIndex: number;
	focused: boolean;
};

export default class CommonMsgModal extends React.Component<CommonMsgModalProps, CommonMsgModalState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	focusableRow: Focusable;

	constructor(props) {
		super(props);
		this.state = {
			curIndex: props.curIndex || 0,
			focused: props.focused || false
		};

		if (props.captureFocus) {
			this.focusableRow = {
				focusable: true,
				index: -1,
				height: 0,
				ref: undefined,
				restoreSavedState: () => {},
				setFocus: this.setFocus,
				moveLeft: this.moveLeft,
				moveRight: this.moveRight,
				moveUp: stopMove,
				moveDown: stopMove,
				exec: this.exec
			};
		}
	}

	componentDidMount() {
		if (this.props.captureFocus) {
			this.context.focusNav.setFocus(this.focusableRow);
		}
	}

	componentWillUnmount() {
		if (this.props.captureFocus) {
			this.context.focusNav.resetFocus();
		}
	}

	componentWillReceiveProps(nextProps: CommonMsgModalProps) {
		if (nextProps.focused !== undefined && nextProps.focused !== this.state.focused) {
			this.setState({ focused: nextProps.focused });
		}

		if (nextProps.curIndex !== undefined && nextProps.curIndex !== this.state.curIndex) {
			this.setState({ curIndex: nextProps.curIndex });
		}
	}

	private setFocus = (isFocused?: boolean): boolean => {
		this.setState({ focused: isFocused });
		return true;
	};

	private moveLeft = (): boolean => {
		if (this.state.curIndex > 0) {
			this.setState({ curIndex: this.state.curIndex - 1 });
		}
		return true;
	};

	private moveRight = (): boolean => {
		const maxIndex = this.props.buttons && this.props.buttons.length;
		if (this.state.curIndex < maxIndex - 1) {
			this.setState({ curIndex: this.state.curIndex + 1 });
		}
		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				if (this.props.captureFocus) {
					this.context.focusNav.hideDialog();
				}
				this.props.onClose && this.props.onClose(true);
				this.props.onClick && this.props.onClick(this.state.curIndex);
				return true;
			case 'back':
			case 'esc':
				if (!this.props.noCancel) {
					if (this.props.captureFocus) {
						this.context.focusNav.hideDialog();
						this.props.onClose && this.props.onClose(false);
					}
				}
				return true;

			default:
				break;
		}

		return true;
	};

	private handleMouseEnter = index => {
		this.setState({ curIndex: index });
	};

	private handleMouseClick = () => {
		this.exec('click');
	};

	render() {
		const { buttons, blackBackground, transparent } = this.props;
		const { focused, curIndex } = this.state;

		return (
			<div className={bem.b({ focused, blackBackground, transparent })}>
				{!blackBackground && <img className={bem.e('logo')} src={logoImg} />}
				<div className={bem.e('container')}>
					<IntlFormatter tagName="div" className={bem.e('title', { blackBackground })}>
						{this.props.title}
					</IntlFormatter>
					<IntlFormatter tagName="div" className={bem.e('text', { blackBackground })}>
						{this.props.text}
					</IntlFormatter>
					<div className={bem.e('buttons', { blackBackground })}>
						{buttons.map((label, index) => {
							return (
								<CtaButton
									key={'modal-' + index}
									className={curIndex === index ? focusedClass : ''}
									label={label}
									index={index}
									onMouseEnter={this.handleMouseEnter}
									onClick={this.handleMouseClick}
								/>
							);
						})}
					</div>
				</div>
			</div>
		);
	}
}
