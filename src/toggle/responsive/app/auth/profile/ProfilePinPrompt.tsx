import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CtaButton from 'ref/responsive/component/CtaButton';
import Link from 'shared/component/Link';
import PinCodeInput from '../../../page/account/registration/PinCodeInput';
import { setPageUrlBeforePinReset } from 'toggle/responsive/util/pinUtil';
import { formDisplayState } from 'toggle/responsive/pageEntry/account/ssoValidationUtil';

import './ProfilePinPrompt.scss';

const bem = new Bem('profile-pin-input');
interface ProfilePinPromptProps {
	onPinChange: (pin: any) => void;
	onSubmit: (e) => void;
	onCancel: () => void;
	error: string;
	loading: boolean;
	displayState: formDisplayState;
	onFocus: () => void;
	showPin: boolean;
}

export default function ProfilePinPrompt({
	onPinChange,
	onSubmit,
	onCancel,
	displayState,
	error,
	onFocus,
	loading,
	showPin
}: ProfilePinPromptProps) {
	return (
		<form className={bem.b()} onSubmit={onSubmit}>
			<h1 className={bem.e('title')}>
				<IntlFormatter>{'@{profileSelector_title_pin|Enter Control PIN to switch to another profile}'}</IntlFormatter>
			</h1>
			{showPin && (
				<PinCodeInput
					onFocus={onFocus}
					onChange={onPinChange}
					required={true}
					displayState={displayState}
					message={error}
					validateOnBlur={false}
					name="pin"
					className="dark-background"
				/>
			)}
			<Link
				to="@AccountProfileResetPIN"
				target="_blank"
				className={bem.e('forgot-pin')}
				onClick={() => {
					setPageUrlBeforePinReset(window ? window.location.pathname : '/');
				}}
			>
				<IntlFormatter elementType="div">{'@{profileSelector_forgot_pin|Forgot PIN?}'}</IntlFormatter>
			</Link>
			<div className={bem.e('buttons')}>
				<IntlFormatter
					elementType={AccountButton}
					type={'submit'}
					className={bem.e('submit')}
					componentProps={{
						ordinal: 'primary',
						theme: 'light',
						loading: loading,
						type: 'submit'
					}}
				>
					{'@{profileSelector_title_pin_submit|Continue}'}
				</IntlFormatter>
				<IntlFormatter
					elementType={CtaButton}
					componentProps={{
						ordinal: 'secondary',
						onClick: onCancel,
						theme: 'light',
						type: 'button'
					}}
				>
					{'@{profileSelector_title_pin_cancel|Cancel}'}
				</IntlFormatter>
			</div>
		</form>
	);
}
