import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CloseIcon from '../../component/modal/CloseIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';

import './ReminderModal.scss';

const bem = new Bem('reminder-overlay');

interface Props {
	activeReminder: api.Reminder;
	onClose: () => void;
	onWatchClick: () => void;
}

export default function ReminderModal(props: Props) {
	const { onWatchClick, onClose, activeReminder } = props;
	const { schedule, channel } = activeReminder;
	const { title } = schedule.item;
	const { title: channelTitle } = channel;

	return (
		<div className={bem.b()}>
			<div className={bem.e('modal')}>
				<div className={bem.e('close')} onClick={onClose}>
					<CloseIcon />
				</div>
				<div className={bem.e('title')}>
					<IntlFormatter>{'@{reminder_label|Programme Reminder}'}</IntlFormatter>
				</div>
				<div className={bem.e('details')}>
					{channelTitle} {title} <IntlFormatter>{'@{reminder_modal_text|is starting soon.}'}</IntlFormatter>
				</div>
				<CtaButton className={bem.e('button')} theme="dark" ordinal="primary" onClick={onWatchClick}>
					<IntlFormatter>{'@{watch_now_btn|Watch Now}'}</IntlFormatter>
				</CtaButton>
			</div>
		</div>
	);
}
