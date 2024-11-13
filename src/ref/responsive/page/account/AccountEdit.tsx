import * as React from 'react';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountEdit as key, Account as accountPageKey } from 'shared/page/pageKey';
import { updateAccount as updateAccountAction } from 'shared/service/action/account';
import { setAppTheme } from 'shared/app/appWorkflow';
import TextInput from 'ref/responsive/component/input/TextInput';
import AccountActionButtons from 'ref/responsive/pageEntry/account/common/AccountActionButtons';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import configAccountPage from './common/configAccountPage';
import LockSVG from 'ref/responsive/component/icons/LockIcon';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { withRouter } from 'react-router';

import './AccountEdit.scss';

interface AccountEditProps extends PageProps {
	updateAccount?: (details: any, detailsOptions: any, detailsMeta: any) => any;
	setAppTheme?: (theme: AppTheme) => void;
	account?: api.Account;
	router?: any;
	config?: state.Config;
}

interface AccountEditState {
	loading?: boolean;
	firstName?: string;
	lastName?: string;
	error?: boolean;
	errorMessage?: string;
	disabled?: boolean;
}

const bem = new Bem('account-edit');

class AccountEdit extends React.Component<AccountEditProps, AccountEditState> {
	state: AccountEditState = {
		loading: false,
		firstName: this.props.account.firstName,
		lastName: this.props.account.lastName,
		disabled: true
	};

	private inputs: { [key: string]: HTMLInputElement } = {};

	componentWillUnmount() {
		this.props.setAppTheme('default');
	}

	private onResponse = response => {
		const { router, config } = this.props;
		if (response.error) {
			this.setState({
				error: true,
				loading: false,
				errorMessage: response.payload.message
			});
		} else {
			const path = getPathByKey(accountPageKey, config);
			router.push(path);
		}
	};

	private onSubmit = e => {
		e.preventDefault();
		const { firstName, lastName } = this.state;
		const { updateAccount } = this.props;
		const details = {
			firstName,
			lastName
		};
		this.setState({ loading: true, error: false, errorMessage: undefined });
		updateAccount(details, undefined, details)
			.then(this.onResponse)
			.catch(error => {
				if (error && error.isCancelled) {
					this.setState({ loading: false });
					return;
				}
				this.setState({
					error: true,
					loading: false,
					errorMessage: error.message
				});
			});
	};

	private onCancel = e => {
		const { router, config } = this.props;
		const path = getPathByKey(accountPageKey, config);
		router.push(path);
	};

	private onTextChange = e => {
		const { name, value } = e.target;
		this.setState({ [name]: value });

		this.setState(prevState => {
			return { ...prevState, [name]: value, disabled: this.isDisabled(prevState, name, value) };
		});
	};

	private isDisabled(state: AccountEditState, name: string, value: string) {
		return !value || (name === 'firstName' ? !state.lastName : !state.firstName);
	}

	private onReference = ref => {
		if (ref) {
			this.inputs[ref.name] = findDOMNode<HTMLInputElement>(ref);
		}
	};

	private onFocus = e => {
		this.inputs[e.target.name].select();
	};

	render() {
		const { firstName, lastName, loading, error, disabled } = this.state;
		const { account } = this.props;

		return (
			<div className={cx('form-white', bem.b())}>
				<IntlFormatter elementType="h4" className={bem.e('title')}>
					{'@{account_edit_title|Your Details}'}
				</IntlFormatter>
				<form className={bem.e('form')} onSubmit={this.onSubmit}>
					<div className={bem.e('email')}>
						<TextInput
							type="email"
							required
							name="email"
							label={'@{form_register_email_only_label|Email}'}
							id="email"
							displayState="disabled"
							value={account.email}
						/>
						<span className={bem.e('lock')}>
							<LockSVG width={16} height={19} />
						</span>
					</div>
					<TextInput
						type="text"
						required
						name="firstName"
						label={'@{form_register_firstName_label|First Name}'}
						id="firstName"
						value={firstName}
						onChange={this.onTextChange}
						onReference={this.onReference}
						onFocus={this.onFocus}
						focus
					/>
					<TextInput
						type="text"
						required
						name="lastName"
						label={'@{form_register_lastName_label|Last Name}'}
						id="lastName"
						value={lastName}
						onChange={this.onTextChange}
						onReference={this.onReference}
						onFocus={this.onFocus}
					/>
					<AccountActionButtons onCancel={this.onCancel} loading={loading} disabled={disabled} />
					{error && this.renderError()}
				</form>
			</div>
		);
	}

	private renderError() {
		const { errorMessage } = this.state;
		return <p className={bem.e('update-error')}>{errorMessage}</p>;
	}
}

function mapStateToProps(state: state.Root) {
	return {
		account: state.account.info || {},
		config: state.app.config
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setAppTheme: (theme: AppTheme) => dispatch(setAppTheme(theme)),
		updateAccount: (details, detailsOptions, detailsMeta) =>
			dispatch(updateAccountAction(details, detailsOptions, detailsMeta))
	};
}

export default configAccountPage(withRouter(AccountEdit), {
	template,
	key,
	mapStateToProps,
	mapDispatchToProps
} as any);
