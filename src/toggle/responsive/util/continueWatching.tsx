import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CtaButton from 'toggle/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

export const getUndoDeleteContinueWatchingNotification = (onUndo: () => void): PassiveNotificationConfig => {
	const bem = new Bem('undo-delete-cw-toast');

	return {
		className: bem.b(),
		content: (
			<div className={bem.e('content')}>
				<IntlFormatter className={bem.e('message')}>{'@{continue_watching_item_removed_label}'}</IntlFormatter>
				<IntlFormatter
					className={bem.e('cta')}
					elementType={CtaButton}
					componentProps={{
						ordinal: 'naked',
						theme: 'dark'
					}}
					onClick={onUndo}
				>
					{'@{mylist_undo_cta}'}
				</IntlFormatter>
			</div>
		),
		position: 'bottom'
	};
};
