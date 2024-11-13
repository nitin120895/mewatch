import * as React from 'react';
import * as PropTypes from 'prop-types';
import SignInSucPromptModal from 'ref/tv/component/modal/CommonMsgModal';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { stopMove } from 'ref/tv/util/focusUtil';
import { InjectedIntl } from 'react-intl';

type SignInSucPromptProps = {
	onBack: () => void;
};

type SignInSucPromptState = Partial<{
	focused: boolean;
	curIndex: number;
}>;

export default class SignInSucPrompt extends React.PureComponent<SignInSucPromptProps, SignInSucPromptState> {
	context: {
		intl: InjectedIntl;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		intl: React.PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;

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
			moveLeft: stopMove,
			moveRight: stopMove,
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

	private exec = (act?: string): boolean => {
		this.onBack();
		return true;
	};

	private onBack = () => {
		this.setState({ focused: false });
		this.props.onBack();
	};

	render() {
		const { formatMessage } = this.context.intl;

		return (
			<SignInSucPromptModal
				focused={this.state.focused}
				curIndex={this.state.curIndex}
				buttons={[formatMessage({ id: 'signin_start_watching' })]}
				title={formatMessage({ id: 'signin_successful' })}
				text={''}
				onClick={() => this.exec('click')}
			/>
		);
	}
}
