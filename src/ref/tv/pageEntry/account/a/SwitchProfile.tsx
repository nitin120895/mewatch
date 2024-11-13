import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { FormattedMessage } from 'react-intl';
import SwitchProfileModal from 'ref/tv/component/modal/SwitchProfileModal';
import './SwitchProfile.scss';

const bem = new Bem('switch-profile');

interface SwitchProfileProps {
	account?: state.Account;
}

interface SwitchProfileState {
	isFocused: boolean;
	isVisible: boolean;
}

export default class SwitchProfile extends React.Component<SwitchProfileProps, SwitchProfileState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false,
			isVisible: false
		};

		this.focusableRow = {
			focusable: false,
			index: -9,
			height: 1,
			ref: undefined,
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

		if (this.props.account.info.profiles.length > 1) {
			this.setState({ isVisible: true });
			this.focusableRow.focusable = true;
		}
	}

	componentWillReceiveProps(nextProps: SwitchProfileProps) {
		if (nextProps.account.info && nextProps.account.info.profiles !== this.props.account.info.profiles) {
			const canFocused = nextProps.account.info.profiles.length > 1;
			this.focusableRow.focusable = canFocused;
			this.setState({ isVisible: canFocused });
		}
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as SwitchProfileState;

		if (state) {
			this.setState({
				isFocused: state.isFocused,
				isVisible: state.isVisible
			});
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		if (!this.state.isVisible) return false;

		this.setState({
			isFocused: isFocus
		});

		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				this.context.focusNav.showDialog(<SwitchProfileModal account={this.props.account} />);
				return true;
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

	render() {
		const { isFocused, isVisible } = this.state;

		return (
			<div
				className={bem.b({ isVisible })}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				onClick={this.handleMouseClick}
			>
				<FormattedMessage id="switch_profile">
					{value => <div className={bem.e('button', { focused: isFocused })}>{value}</div>}
				</FormattedMessage>
			</div>
		);
	}
}
