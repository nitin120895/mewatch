import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

export const PASSWORD_RESET_MODAL = 'password-reset-modal';
export const passwordResetModal = (onClose: () => void) => {
	return {
		title: '@{form_newPassword_step2_title}',
		children: (
			<div>
				<IntlFormatter elementType="p" className="modal-info">
					{'@{form_newPassword_step2_info}'}
				</IntlFormatter>
			</div>
		),
		confirmLabel: '@{form_confirm_ok|Ok}',
		onClose,
		id: PASSWORD_RESET_MODAL,
		className: PASSWORD_RESET_MODAL
	};
};
