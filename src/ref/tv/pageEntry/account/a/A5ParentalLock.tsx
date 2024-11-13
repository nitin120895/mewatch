import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { setMinRatingPlaybackGuard } from 'shared/account/accountWorkflow';
import { A5ParentalLock as template } from 'shared/page/pageEntryTemplate';
import { Bem } from 'shared/util/styles';
import { isInvalidToken } from 'shared/util/tokens';
import EnterPasswordModal from 'ref/tv/component/modal/EnterPasswordModal';
import TitledListModal from 'ref/tv/component/modal/TitledListModal';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { skipMove } from 'ref/tv/util/focusUtil';
import { setPaddingStyle } from 'ref/tv/util/rows';
import sass from 'ref/tv/util/sass';
import './A5ParentalLock.scss';

const bem = new Bem('a5');

interface A5ParentalLockProps extends PageEntryListProps {
	account?: state.Account;
	profile?: state.Profile;
	onItemClicked?: (index: number) => void;
}

interface A5ParentalLockState {
	isFocused: boolean;
	pinEnabled: boolean;
	focusIndex: number;
}

interface A5ParentalLockDispatchProps {
	setMinRatingPlaybackGuard: (minRatingPlaybackGuard: string) => void;
}

interface A5ParentalLockStateProps {
	classification?: { [key: string]: api.Classification };
	accountSettingsToken: api.AccessToken;
	minRatingPlaybackGuard: string;
}

class A5ParentalLockClass extends React.Component<
	A5ParentalLockProps & A5ParentalLockDispatchProps & A5ParentalLockStateProps,
	A5ParentalLockState
> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private selectorArr = [];

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false,
			pinEnabled: props.account
				? props.account.info && props.account.info.pinEnabled && props.minRatingPlaybackGuard
				: false,
			focusIndex: 0
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: props.title ? sass.a5ParentalLockHeight : sass.a5ParentalLockLessHeight,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};

		this.selectorArr = [];
		const classifications = this.props.classification;

		for (let key in classifications) {
			this.selectorArr.push({
				key: key,
				label: classifications[key].name,
				code: classifications[key].code
			});
		}
	}

	componentDidMount() {
		this.context.focusNav.registerRow(this.focusableRow);

		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as A5ParentalLockState;
		if (state) {
			this.setState({
				isFocused: state.isFocused,
				pinEnabled: state.pinEnabled
			});
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({ isFocused: isFocus });
		return true;
	};

	private moveLeft = (): boolean => {
		const { focusIndex } = this.state;

		if (focusIndex !== 0) {
			this.setState({ focusIndex: focusIndex - 1 });
		}

		return true;
	};

	private moveRight = (): boolean => {
		const { focusIndex, pinEnabled } = this.state;

		if (focusIndex === 0 && pinEnabled) {
			this.setState({ focusIndex: focusIndex + 1 });
		}

		return true;
	};

	private tryChangeParentalLock = callback => {
		const { account, accountSettingsToken } = this.props;
		let hasValidToken = !!accountSettingsToken;

		if (hasValidToken && isInvalidToken(accountSettingsToken)) {
			hasValidToken = false;
		}

		if (account && !hasValidToken) {
			this.context.focusNav.showDialog(<EnterPasswordModal hasPin={account.info.pinEnabled} close={callback} />);
		} else {
			if (!account.info.pinEnabled) {
				this.context.focusNav.showDialog(
					<EnterPasswordModal baseState={'pin'} hasPin={account.info.pinEnabled} close={callback} />
				);
			} else {
				callback(true);
			}
		}
	};

	private exec = (act?: string): boolean => {
		const { focusIndex, pinEnabled } = this.state;

		switch (act) {
			case 'click':
				if (focusIndex === 0) {
					// current focus on switch
					if (pinEnabled) {
						// turn off
						this.tryChangeParentalLock(ret => {
							if (ret) {
								this.props.setMinRatingPlaybackGuard('');
								this.setState({ pinEnabled: false });
							}
						});
					} else {
						// show pin, and turn on
						this.tryChangeParentalLock(ret => {
							if (ret) {
								this.props.setMinRatingPlaybackGuard(this.selectorArr[0].code);
								this.setState({ pinEnabled: true });
							}
						});
					}

					return true;
				}

				this.state.pinEnabled &&
					this.context.focusNav.showDialog(
						<TitledListModal
							title={'@{classification|Classifications}'}
							entries={this.selectorArr}
							selectedKey={this.props.minRatingPlaybackGuard}
							ref={this.context.focusNav.requestFocus}
							onItemClicked={this.onItemClickedSelector}
						/>
					);
				return true;
			default:
				break;
		}
		return false;
	};

	private onItemClickedSelector = (index: number) => {
		this.context.focusNav.hideDialog();

		setImmediate(() => {
			if (index === -1) {
				return true;
			} else {
				this.tryChangeParentalLock(ret => {
					if (ret) {
						const ratingGuard = this.selectorArr[index].code;
						this.props.setMinRatingPlaybackGuard(ratingGuard);
					}
				});
			}
		});
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private itemMouseEnter = (index: number) => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
		this.setState({ focusIndex: index });
	};

	private mouseEnterLock = () => {
		this.itemMouseEnter(0);
	};

	private mouseEnterSelectorBtn = () => {
		this.itemMouseEnter(1);
	};

	private handleClickLock = () => {
		const { pinEnabled } = this.state;

		this.tryChangeParentalLock(ret => {
			if (ret) {
				if (pinEnabled) {
					this.props.setMinRatingPlaybackGuard('');
					this.setState({ pinEnabled: false });
				} else {
					this.props.setMinRatingPlaybackGuard(this.selectorArr[0].code);
					this.setState({ pinEnabled: true });
				}
			}
		});
	};

	private handleClickSelectorBtn = () => {
		this.exec('click');
	};

	render() {
		const { isFocused, pinEnabled, focusIndex } = this.state;

		return (
			<div className={bem.b()} ref={ref => (this.ref = ref)}>
				<div className={bem.e('title')}>{this.props.title}</div>
				<div
					className={bem.e('lock', { focused: isFocused && focusIndex === 0 })}
					onMouseEnter={this.mouseEnterLock}
					onMouseLeave={this.handleMouseLeave}
					onClick={this.handleClickLock}
				>
					<FormattedMessage id="switch_on">{value => <div className={bem.e('on')}>{value}</div>}</FormattedMessage>
					<FormattedMessage id="switch_off">{value => <div className={bem.e('off')}>{value}</div>}</FormattedMessage>
					<div className={bem.e('mask', { on: pinEnabled, focused: isFocused })} />
				</div>
				{this.state.pinEnabled && this.renderSelectorButton()}
			</div>
		);
	}

	private renderSelectorButton() {
		const { isFocused, focusIndex } = this.state;
		const { minRatingPlaybackGuard } = this.props;
		const minRating = this.selectorArr.find(s => s.code === minRatingPlaybackGuard);
		let minRatingValue = '';

		if (minRating) {
			minRatingValue = minRating.label;
		}

		return (
			<div className={bem.e('selector')}>
				<FormattedMessage id="a5_parentalLock_text">
					{value => <div className={bem.e('text')}>{value}</div>}
				</FormattedMessage>
				<div
					className={bem.e('dropBtn', { focused: isFocused && focusIndex === 1 })}
					onMouseEnter={this.mouseEnterSelectorBtn}
					onMouseLeave={this.handleMouseLeave}
					onClick={this.handleClickSelectorBtn}
				>
					<FormattedMessage id="a5_parentalLock_select">
						{value => <span className={bem.e('pg')}>{minRatingValue || value}</span>}
					</FormattedMessage>
					<i className={cx(bem.e('icon'), 'icon icon-drop-button')} />
				</div>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch: any): A5ParentalLockDispatchProps {
	return {
		setMinRatingPlaybackGuard: (minRatingPlaybackGuard: string) =>
			dispatch(setMinRatingPlaybackGuard(minRatingPlaybackGuard))
	};
}

function mapStateToProps(state: state.Root): A5ParentalLockStateProps {
	let classification = state.app.config.classification;
	let accountSettingsToken;
	let token;
	if (state.session.tokens) {
		for (let i = 0; i < state.session.tokens.length; i++) {
			token = state.session.tokens[i];
			if (token.scope === 'Settings' && token.type === 'UserAccount') {
				accountSettingsToken = token;
			}
		}
	}

	const minRatingPlaybackGuard = state.account.info.minRatingPlaybackGuard;

	return {
		minRatingPlaybackGuard,
		classification,
		accountSettingsToken
	};
}

const A5ParentalLock: any = connect<any, any, A5ParentalLockProps>(
	mapStateToProps,
	mapDispatchToProps
)(A5ParentalLockClass);
A5ParentalLock.template = template;

export default A5ParentalLock;
