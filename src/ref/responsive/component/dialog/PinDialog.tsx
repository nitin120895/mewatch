import * as React from 'react';
import { connect } from 'react-redux';
import { requestToken } from 'shared/account/sessionWorkflow';
import { noop } from 'shared/util/function';
import PinInput from 'ref/responsive/component/input/PinInput';
import Dialog from 'ref/responsive/component/dialog/Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getPINErrorByCode } from 'shared/util/errorMessages';

import './PinDialog.scss';

interface PinDialogProps {
	scopes?: Array<TokenScope>;
	requestToken?: (scopes: TokenScope[], pin: string, tokentype: TokenType) => any;
	onFailure?: (e: { isCancelled: boolean }) => any;
	onSuccess?: (response: any) => any;
	tokenType?: TokenType;
}

interface PinDialogState {
	pin: Array<number>;
	loading?: boolean;
	error?: string;
}

class PinDialog extends React.Component<PinDialogProps, PinDialogState> {
	static defaultProps = {
		onFailure: noop,
		onSuccess: noop,
		scopes: []
	};

	state: PinDialogState = {
		pin: []
	};

	private onChange = pin => {
		this.setState({ pin });
	};

	private onFocus = e => {
		this.setState({ error: undefined });
	};

	private onSubmit = e => {
		e.preventDefault();
		const { pin } = this.state;
		const { requestToken, onSuccess, scopes, tokenType } = this.props;
		this.setState({ loading: true });
		requestToken(scopes, pin.join(''), tokenType).then(
			response => {
				if (response.error) {
					this.setState({ loading: false, error: getPINErrorByCode(response.payload.code), pin: [] });
				} else {
					this.setState({ loading: false });
					onSuccess(response.payload);
				}
			},
			error => {
				this.setState({ loading: false, error: getPINErrorByCode(error.code), pin: [] });
			}
		);
	};

	private onCancel = () => {
		const { onFailure } = this.props;
		onFailure({ isCancelled: true });
	};

	render() {
		const { pin, error, loading } = this.state;

		return (
			<Dialog onClose={this.onCancel}>
				<DialogTitle>{'@{app.dialogs.pinTitle|Enter PIN}'}</DialogTitle>
				<form className="form-white" onSubmit={this.onSubmit}>
					<PinInput
						onChange={this.onChange}
						onFocus={this.onFocus}
						disabled={loading}
						digits={pin}
						error={error}
						required
						focusOnUpdate
						label={'@{form_register_simple_pin_label|PIN}'}
					/>
					<IntlFormatter
						elementType={AccountButton}
						componentProps={{
							type: 'submit',
							disabled: pin.length !== 4,
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
		requestToken: (scopes: TokenScope[], pin: string, tokenType: TokenType) =>
			dispatch(requestToken(scopes, undefined, pin, tokenType || 'UserProfile'))
	};
}

export default connect<any, any, PinDialogProps>(
	undefined,
	mapDispatchToProps
)(PinDialog);
