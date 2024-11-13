import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { FormattedMessage } from 'react-intl';
import sass from 'ref/tv/util/sass';
import './SignoutButton.scss';

const bem = new Bem('signout-button');

interface SignoutButtonProps {
	pageLoading?: boolean;
	promptSignOut?: () => void;
}

interface SignoutButtonState {
	isFocused: boolean;
}

export default class SignoutButton extends React.Component<SignoutButtonProps, SignoutButtonState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLDivElement;

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false
		};

		this.focusableRow = {
			focusable: true,
			index: 99998,
			height: sass.signoutBtnHeight,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.context.focusNav.registerRow(this.focusableRow);
		this.focusableRow.ref = this.ref;
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as SignoutButtonState;
		if (state) {
			this.setState({
				isFocused: state.isFocused
			});
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		if (this.ref)
			this.setState({
				isFocused: isFocus
			});

		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				this.props.promptSignOut();
				break;
			default:
				break;
		}

		return false;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private handleMouseClick = () => {
		this.exec('click');
	};

	private onRef = ref => {
		this.ref = ref;
		this.focusableRow.ref = ref;
	};

	render() {
		if (this.props.pageLoading) {
			return <div />;
		}

		return (
			<div className={bem.b()} ref={this.onRef}>
				<FormattedMessage id="signout">
					{value => (
						<div
							className={bem.e('button', { focused: this.state.isFocused })}
							onMouseEnter={this.handleMouseEnter}
							onMouseLeave={this.handleMouseLeave}
							onClick={this.handleMouseClick}
						>
							{value}
						</div>
					)}
				</FormattedMessage>
			</div>
		);
	}
}
