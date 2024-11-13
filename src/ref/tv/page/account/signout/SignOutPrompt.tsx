import * as React from 'react';
import * as PropTypes from 'prop-types';
import SignOutPromptModal from 'ref/tv/component/modal/CommonMsgModal';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { stopMove } from 'ref/tv/util/focusUtil';
import { InjectedIntl } from 'react-intl';

type SignOutPromptProps = {
	title?: string;
	text?: string;
	onBack: () => void;
	onSignOut: () => void;
};

type SignOutPromptState = Partial<{
	focused: boolean;
	curIndex: number;
}>;

export default class SignOutPrompt extends React.PureComponent<SignOutPromptProps, SignOutPromptState> {
	context: {
		intl: InjectedIntl;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		intl: React.PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	focusableRow: Focusable;

	constructor(props) {
		super(props);
		this.state = {
			focused: false,
			curIndex: 0
		};

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

	componentDidMount() {
		this.context.focusNav.setFocus(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.resetFocus();
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			focused: isFocus
		});

		return true;
	};

	private moveLeft = (): boolean => {
		if (this.state.curIndex !== 0) {
			this.setState({ curIndex: this.state.curIndex - 1 });
		}

		return true;
	};

	private moveRight = (): boolean => {
		if (this.state.curIndex === 0) {
			this.setState({ curIndex: this.state.curIndex + 1 });
		}

		return true;
	};

	private exec = (act?: string, index?: number): boolean => {
		let curIndex;

		if (index !== undefined) {
			curIndex = index;
		} else {
			curIndex = this.state.curIndex;
		}

		switch (act) {
			case 'click':
				if (curIndex === 0) {
					// go to signin page
					this.props.onSignOut();
					return;
				}
				break;

			default:
				break;
		}

		this.onBack();
		return true;
	};

	private onBack = () => {
		this.setState({ focused: false });
		this.props.onBack();
	};

	private handleClick = index => {
		this.setState({ curIndex: index });
		this.exec('click', index);
	};

	render() {
		const { formatMessage } = this.context.intl;

		return (
			<SignOutPromptModal
				focused={this.state.focused}
				curIndex={this.state.curIndex}
				buttons={[formatMessage({ id: 'signout' }), formatMessage({ id: 'cancel' })]}
				title={formatMessage({ id: 'signout' })}
				text={formatMessage({ id: 'signout_prompt' })}
				onClick={this.handleClick}
			/>
		);
	}
}
