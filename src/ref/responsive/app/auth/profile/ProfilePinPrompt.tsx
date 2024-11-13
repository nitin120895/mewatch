import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PinInput from 'ref/responsive/component/input/PinInput';
import AccountButton from 'ref/responsive/component/input/AccountButton';

import './ProfilePinPrompt.scss';

const bem = new Bem('profile-pin-input');

interface ProfilePinPromptProps {
	name: string;
	pin: number[];
	onPinChange: (pin: any) => void;
	onPinFocus: (e) => void;
	onPinKeyDown: (e) => void;
	onSubmit: (e) => void;
	onCancel: () => void;
	error: string;
	showPin: boolean;
	loading: boolean;
}

export default function ProfilePinPrompt({
	pin,
	onPinChange,
	onSubmit,
	onCancel,
	onPinFocus,
	onPinKeyDown,
	error,
	name,
	showPin,
	loading
}: ProfilePinPromptProps) {
	return (
		<form className={bem.b()} onSubmit={onSubmit}>
			<h1 className={bem.e('title')}>
				<IntlFormatter>{'@{profileSelector_title_pin_partOne|Enter account PIN for}'}</IntlFormatter>
				<br />
				<span>{` ${name} `}</span>
				<IntlFormatter>{'@{profileSelector_title_pin_partTwo|to start watching.}'}</IntlFormatter>
			</h1>
			<PinInput
				digits={pin}
				onChange={onPinChange}
				className={bem.e('pin')}
				dark={true}
				error={error}
				focusOnUpdate={showPin}
				onFocus={onPinFocus}
				onKeyDown={onPinKeyDown}
			/>
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
					elementType={AccountButton}
					componentProps={{
						ordinal: 'naked',
						onClick: onCancel,
						type: 'button'
					}}
				>
					{'@{profileSelector_title_pin_cancel|Cancel}'}
				</IntlFormatter>
			</div>
		</form>
	);
}
