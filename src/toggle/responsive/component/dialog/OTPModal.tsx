import * as React from 'react';
import { Bem } from 'shared/util/styles';
import Dialog from 'toggle/responsive/component/dialog/Dialog';
import OTP from '../OTP';

import './OTPModal.scss';

interface OwnProps {
	onSuccess?: (response: any) => any;
	onFailure?: (e: { isCancelled: boolean }) => any;
	onClose?: () => any;
}

const bem = new Bem('otp-modal');

export default class OTPModal extends React.PureComponent<OwnProps> {
	render() {
		const { onSuccess, onFailure, onClose } = this.props;
		return (
			<Dialog onClose={onClose} className={bem.b()}>
				<OTP onSuccess={onSuccess} onFailure={onFailure} onClose={onClose} />
			</Dialog>
		);
	}
}
