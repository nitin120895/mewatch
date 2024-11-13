import * as React from 'react';
import { connect } from 'react-redux';
import { requestToken } from 'shared/account/sessionWorkflow';
import { Cancellation } from 'shared/app/errors';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface PinPromptProps {
	prompt: AuthPrompt;
	requestToken?: (scopes: TokenScope[], pin: string, tokenType: TokenType) => any;
	cancel: () => any;
}

interface PinPromptState {
	pin?: string;
}

class PinPrompt extends React.Component<PinPromptProps, PinPromptState> {
	state: PinPromptState = {
		pin: ''
	};

	private onChange = e => {
		this.setState({ [e.target.name]: e.target.value });
	};

	private onSubmit = e => {
		e.preventDefault();
		const { prompt, requestToken } = this.props;
		requestToken(prompt.body, this.state.pin, prompt.tokenType).then(res => {
			if (res.error) return;
			return prompt.resolve && prompt.resolve(res.payload);
		});
	};

	private onCancel = e => {
		e.preventDefault();
		const { prompt, cancel } = this.props;
		if (prompt.reject) prompt.reject(new Cancellation('Pin prompt cancelled'));
		cancel();
	};

	render() {
		return (
			<form onSubmit={this.onSubmit}>
				<IntlFormatter
					elementType="input"
					name="pin"
					type="password"
					value={this.state.pin}
					onChange={this.onChange}
					formattedProps={{
						placeholder: '@{form_register_pin_label|PIN}'
					}}
				/>
				{this.renderError()}
				<div>
					<IntlFormatter elementType="button" type="submit">
						{'@{account_common_submit_button_label|Submit}'}
					</IntlFormatter>
					<IntlFormatter elementType="button" onClick={this.onCancel}>
						{'@{account_common_cancel_button_label|Cancel}'}
					</IntlFormatter>
				</div>
			</form>
		);
	}

	private renderError(): any {
		const { error } = this.props.prompt;
		if (!error) return false;
		return <span className="auth-prompt__error">{error.message}</span>;
	}
}

function mapDispatchToProps(dispatch) {
	return {
		requestToken: (scopes: TokenScope[], pin: string, tokenType: TokenType) =>
			dispatch(requestToken(scopes, undefined, pin, tokenType || 'UserProfile'))
	};
}

export default connect<any, any, PinPromptProps>(
	undefined,
	mapDispatchToProps
)(PinPrompt);
