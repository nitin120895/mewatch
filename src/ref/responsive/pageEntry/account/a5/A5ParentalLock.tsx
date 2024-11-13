import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { A5ParentalLock as template } from 'shared/page/pageEntryTemplate';
import { updateAccount } from 'shared/service/action/account';
import AccountEntryWrapper from '../common/AccountEntryWrapper';
import AccountSettingSwitch from '../common/AccountSettingSwitch';
import AccordionItem from 'ref/responsive/component/AccordionItem';
import CreatePinForm from 'ref/responsive/component/CreatePinForm';
import ParentalLockRatings from './ParentalLockRatings';
import * as AccountActions from 'shared/service/action/account';

import './A5ParentalLock.scss';

interface A5ParentalLockProps extends PageEntryPropsBase {
	onUpdateAccount?: (body, options?, info?) => Promise<any>;
	setPin?: (pin?: any) => Promise<any>;
	minRatingPlaybackGuard?: string;
	classifications?: { [id: string]: api.Classification };
	pinEnabled: boolean;
}

interface A5ParentalLockState {
	lockEnabled: boolean;
	minRatingPlaybackGuard: string;
	updateSuccess?: boolean;
	loading?: boolean;
	ratingLoading?: boolean;
	pinLoading?: boolean;
	error?: string | boolean;
	pinError?: boolean;
}

const bem = new Bem('a5');

class A5ParentalLock extends React.Component<A5ParentalLockProps, A5ParentalLockState> {
	static defaultProps = {
		minRatingPlaybackGuard: ''
	};

	state: A5ParentalLockState = {
		lockEnabled: !!this.props.minRatingPlaybackGuard,
		minRatingPlaybackGuard: this.props.minRatingPlaybackGuard
	};

	private successTimeout: number;

	componentWillReceiveProps(nextProps) {
		if (this.props.minRatingPlaybackGuard !== nextProps.minRatingPlaybackGuard) {
			// Is optimistically updated on change, but we need to keep it in sync
			// if it gets changed because say, the API call failed.
			this.setState({ minRatingPlaybackGuard: nextProps.minRatingPlaybackGuard });
		}
	}

	componentWillUnmount() {
		this.clearSuccessTimeout();
	}

	private clearSuccessTimeout() {
		window.clearTimeout(this.successTimeout);
	}

	private setSuccess() {
		this.setState({ updateSuccess: true });
		this.clearSuccessTimeout();
		this.successTimeout = window.setTimeout(() => this.setState({ updateSuccess: false }), 3000);
	}

	private getRatingDisplayState() {
		const { updateSuccess, ratingLoading, error, loading } = this.state;
		if (ratingLoading || loading) return 'pending';
		if (error) return 'error';
		if (updateSuccess) return 'success';
		return undefined;
	}

	private onLockSwitchToggle = () => {
		const { lockEnabled } = this.state;
		const { classifications } = this.props;
		const minRatingPlaybackGuard = lockEnabled ? '' : Object.values(classifications)[0].code;

		this.setState({ loading: true, error: false, updateSuccess: false, lockEnabled: !lockEnabled }, () => {
			this.setParentalLock(minRatingPlaybackGuard)
				.then(() => {
					this.setState({
						pinError: false
					});
				})
				.catch(error => {
					this.setState({ pinError: !error.isCancelled, lockEnabled: !this.state.lockEnabled });
				});
		});
	};

	private setParentalLock(minRatingPlaybackGuard) {
		const { onUpdateAccount } = this.props;
		const savedState = { ...this.state };
		this.clearSuccessTimeout();
		return onUpdateAccount({ minRatingPlaybackGuard }, undefined, { minRatingPlaybackGuard })
			.then(response => {
				this.setState({ loading: false, error: response.error });
			})
			.catch(error => {
				if (error.isCancelled) {
					// Discard updated choice and restore previous state
					this.setState({ ...savedState, loading: false });
				} else {
					this.setState({ loading: false, error });
				}
				// pass the error up
				throw error;
			});
	}

	private onRatingChange = newRating => {
		this.setState({ ratingLoading: true, updateSuccess: false, error: false }, () => {
			this.setParentalLock(newRating)
				.then(() => {
					this.setSuccess();
					this.setState({ ratingLoading: false });
				})
				.catch(() => this.setState({ ratingLoading: false }));
		});
	};

	private onCancelPin = () => {
		let promise = Promise.resolve();

		if (this.state.minRatingPlaybackGuard) {
			// No pin, no rating guard. Thems the rules.
			promise = this.setParentalLock('');
		}

		promise
			.then(() => {
				this.setState({ lockEnabled: false });
			})
			.catch(error => this.setState({ pinError: error.isCancelled }));
	};

	private onCreatePin = pin => {
		const { minRatingPlaybackGuard } = this.state;
		const { classifications, setPin } = this.props;
		this.setState({ pinLoading: true });
		setPin({ pin })
			.then(res => {
				if (res.error) {
					this.setState({
						pinLoading: false,
						pinError: true
					});
				} else {
					const defaultGuard = Object.values(classifications)[0].code;
					return this.setParentalLock(minRatingPlaybackGuard || defaultGuard);
				}
			})
			.then(() => {
				this.setState({
					pinLoading: false
				});
			})
			.catch(error => {
				this.setState({
					pinLoading: false,
					pinError: !error.isCancelled
				});
			});
	};

	render() {
		const { classifications, pinEnabled } = this.props;
		const { loading, lockEnabled, minRatingPlaybackGuard, pinError, pinLoading } = this.state;
		const isRatingVisibile = classifications && lockEnabled;
		return (
			<div className={bem.b()}>
				<AccountEntryWrapper {...this.props}>
					<AccountSettingSwitch
						className={bem.e('switch')}
						label="@{account_a5_description|Restrict access via PIN when watching content from and above a selected classification.}"
						onChange={this.onLockSwitchToggle}
						checked={lockEnabled}
						disabled={loading}
					/>
					<AccordionItem className={bem.e('rating-container')} open={isRatingVisibile}>
						<div className={bem.e('lock-level')}>
							{pinEnabled ? (
								<ParentalLockRatings
									classifications={classifications}
									displayState={this.getRatingDisplayState()}
									rating={minRatingPlaybackGuard}
									onRatingChange={this.onRatingChange}
								/>
							) : (
								<CreatePinForm
									error={pinError}
									onSubmit={this.onCreatePin}
									onCancel={this.onCancelPin}
									loading={pinLoading}
									title={`@{account_a5_createPin_title|Create a Pin}`}
									children={`@{account_createPin_hint|The account PIN is applicable for all profiles}`}
								/>
							)}
						</div>
					</AccordionItem>
				</AccountEntryWrapper>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): any {
	const { account, app } = state;
	const accountInfo = account.info || ({} as api.Account);

	return {
		minRatingPlaybackGuard: accountInfo.minRatingPlaybackGuard,
		classifications: app.config.classification,
		pinEnabled: accountInfo.pinEnabled
	};
}

const actions = {
	onUpdateAccount: updateAccount,
	setPin: AccountActions.changePin
};

const Component: any = connect<any, any, A5ParentalLockProps>(
	mapStateToProps,
	actions
)(A5ParentalLock);
Component.template = template;

export default Component;
