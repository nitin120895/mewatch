import * as React from 'react';
import { connect } from 'react-redux';
import { requestToken } from 'shared/account/sessionWorkflow';
import { noop } from 'shared/util/function';
import PasswordInput from 'ref/responsive/component/input/PasswordInput';
import Dialog from 'ref/responsive/component/dialog/Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getPasswordErrorByCode } from 'shared/util/errorMessages';

import './PasswordDialog.scss';

interface PasswordDialogProps {
	scopes: Array<TokenScope>;
	requestToken?: (scopes: TokenScope[], password: string) => any;
	onFailure?: (e: { isCancelled: boolean }) => any;
	onSuccess?: (response: any) => any;
}

interface PasswordDialogState {
	password?: string;
	loading?: boolean;
	error?: string;
}

class PasswordDialog extends React.Component<PasswordDialogProps, PasswordDialogState> {
	static defaultProps = {
		onFailure: noop,
		onSuccess: noop,
		onClose: noop,
		scopes: []
	};

	state: PasswordDialogState = {
		password: ''
	};

	private onChange = e => {
		this.setState({ [e.target.name]: e.target.value });
	};

	private onFocus = e => {
		this.setState({ error: undefined });
	};

	private onSubmit = e => {
		e.preventDefault();
		const { scopes, requestToken, onSuccess } = this.props;
		this.setState({ loading: true });
		requestToken(scopes, this.state.password).then(
			response => {
				if (response.error) {
					this.setState({ loading: false, error: getPasswordErrorByCode(response.payload.code) });
				} else {
					this.setState({ loading: false });
					onSuccess(response.payload);
				}
			},
			error => {
				this.setState({ loading: false, error });
			}
		);
	};

	private onCancel = () => {
		const { onFailure } = this.props;
		onFailure({ isCancelled: true });
	};

	render() {
		const { loading, password, error } = this.state;

		const displayState = error ? 'error' : 'default';
		return (
			<Dialog onClose={this.onCancel}>
				<DialogTitle>{'@{app.dialogs.passwordTitle|Enter Password}'}</DialogTitle>
				<form className="form-white" onSubmit={this.onSubmit}>
					<PasswordInput
						displayState={displayState}
						value={password}
						onChange={this.onChange}
						onFocus={this.onFocus}
						id="password"
						name="password"
						disabled={loading}
						message={error}
						required
						label="@{form_signIn_password_label|Password}"
					/>
					<IntlFormatter
						elementType={AccountButton}
						componentProps={{
							type: 'submit',
							disabled: password.length === 0,
							loading
						}}
					>
						{'@{app.confirm|Confirm}'}
					</IntlFormatter>
					<IntlFormatter
						elementType={CtaButton}
						onClick={this.onCancel}
						componentProps={{
							ordinal: 'naked',
							theme: 'light'
						}}
					>
						{'@{app.cancel|Cancel}'}
					</IntlFormatter>
				</form>
			</Dialog>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		requestToken: (scopes: TokenScope[], password: string) => dispatch(requestToken(scopes, password))
	};
}

export default connect<any, any, PasswordDialogProps>(
	undefined,
	mapDispatchToProps
)(PasswordDialog);
