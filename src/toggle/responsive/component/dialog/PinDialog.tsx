import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';
import Dialog from 'ref/responsive/component/dialog/Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getPINErrorByCode } from 'shared/util/errorMessages';
import { requestPlaybackToken } from 'shared/app/playerWorkflow';
import { MIN_SECURE_STRING_LENGTH } from 'toggle/responsive/pageEntry/account/accountUtils';
import RestrictedContentIcon from '../icons/RestrictedContentIcon';
import PinCodeInput from '../../page/account/registration/PinCodeInput';
import { formDisplayState } from '../../pageEntry/account/ssoValidationUtil';
import Link from 'shared/component/Link';

import './PinDialog.scss';

const bem = new Bem('pin-dialog');

const ATTEMPTS = 5;

interface PinDialogProps {
	scopes?: Array<TokenScope> | ['Playback'];
	requestPlaybackToken: (body: api.RequestPlaybackToken) => Promise<any>;
	onFailure?: (e: { isCancelled: boolean }) => any;
	onSuccess?: (response: any) => any;
	onClose?: () => void;
	tokenType?: TokenType;
}

interface PinDialogState {
	pin: string;
	loading?: boolean;
	error?: string;
	currentAttempt: number;
	displayState: formDisplayState;
}

class PinDialog extends React.Component<PinDialogProps, PinDialogState> {
	static defaultProps = {
		onFailure: noop,
		onSuccess: noop,
		scopes: []
	};

	state: PinDialogState = {
		pin: '',
		currentAttempt: 1,
		displayState: formDisplayState.DEFAULT
	};

	private onChange = e => {
		const newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	};

	private onFocus = () => {
		this.setState({ error: undefined, displayState: formDisplayState.DEFAULT });
	};

	private onSubmit = e => {
		e.preventDefault();
		const { pin } = this.state;
		const { requestPlaybackToken, onSuccess, scopes, tokenType } = this.props;
		this.setState({ loading: true });

		requestPlaybackToken({
			scopes,
			pin,
			tokenType,
			onSuccess: payload => {
				this.setState({ loading: false });
				onSuccess(payload);
			},
			onError: payload => {
				this.setState({
					loading: false,
					error: getPINErrorByCode(payload.code),
					pin: '',
					displayState: formDisplayState.ERROR
				});
			}
		}).catch(this.onAttemptFailed);
	};

	private onAttemptFailed = error => {
		this.setState(
			prevState => ({
				loading: false,
				error: getPINErrorByCode(error.code),
				pin: '',
				currentAttempt: prevState.currentAttempt + 1,
				displayState: formDisplayState.ERROR
			}),
			() => {
				if (this.state.currentAttempt >= ATTEMPTS) {
					this.setState({ error: '@{enter_pin_attempt_exceeds}', displayState: formDisplayState.ERROR });
				}
			}
		);
	};

	private onCancel = () => {
		const { onClose } = this.props;
		onClose();
	};

	renderPlaybackModalBody() {
		return (
			<div>
				<RestrictedContentIcon className={bem.e('icon')} />
				<DialogTitle className={bem.e('restricted-title')}>{'@{restricted_content|Rated Content}'}</DialogTitle>
				<div className={bem.e('description')}>
					<IntlFormatter>
						{'@{pin_modal_enter_parental_pin|Please enter your Parental Control PIN to view this content.}'}
					</IntlFormatter>
				</div>
			</div>
		);
	}

	render() {
		const { pin, error, loading, displayState } = this.state;
		const isPlayback = (this.props.scopes as PlaybackTokenScope[]).includes('Playback');
		const label = isPlayback ? '' : '@{form_register_simple_pin_label|PIN}';
		const submitButtonLabel = isPlayback ? '@{create_pin_overlay_proceed|Proceed}' : '@{app.confirm|Confirm}';

		return (
			<Dialog onClose={this.onCancel} className={bem.b()}>
				{isPlayback ? this.renderPlaybackModalBody() : <DialogTitle>{'@{app.dialogs.pinTitle|Enter PIN}'}</DialogTitle>}
				<form className="form-white" onSubmit={this.onSubmit} autoComplete="off">
					<PinCodeInput
						onFocus={this.onFocus}
						onChange={this.onChange}
						required={true}
						displayState={displayState}
						message={error}
						label={label}
						name="pin"
					/>
					<div className={bem.e('forgot-pin')}>
						<Link to="@AccountProfileResetPIN" target="_blank">
							<IntlFormatter>{'@{profileSelector_forgot_pin|Forgot PIN?}'}</IntlFormatter>
						</Link>
					</div>
					<div className={bem.e('buttons')}>
						<IntlFormatter
							elementType={AccountButton}
							componentProps={{
								type: 'submit',
								ordinal: 'primary',
								disabled: pin.length !== MIN_SECURE_STRING_LENGTH,
								loading
							}}
						>
							{submitButtonLabel}
						</IntlFormatter>
						<IntlFormatter
							elementType={CtaButton}
							onClick={this.onCancel}
							componentProps={{
								ordinal: 'secondary',
								theme: 'dark'
							}}
						>
							{'@{app.cancel|Cancel}'}
						</IntlFormatter>
					</div>
				</form>
			</Dialog>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		requestPlaybackToken: (body: api.RequestPlaybackToken): Promise<any> => dispatch(requestPlaybackToken(body))
	};
}

export default connect<any, any, PinDialogProps>(
	undefined,
	mapDispatchToProps
)(PinDialog);
