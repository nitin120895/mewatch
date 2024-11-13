import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import { isAnonymousUser } from 'shared/account/sessionWorkflow';
import { wrapReminderCta } from 'shared/analytics/components/ItemWrapper';
import { addReminder, deleteReminder } from 'shared/service/action/profile';
import * as profile from 'shared/service/profile';
import { CloseModal, HideAllModals, OpenModal, ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import { get } from 'shared/util/objects';
import { redirectToSignPage } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import { getRequiredModalForAnonymous } from 'toggle/responsive/player/playerModals';
import {
	EPG2ItemState,
	getReminder,
	getReminderNotificationContent,
	isFutureState,
	saveChannel,
	saveEPGDate,
	setReminderData
} from 'toggle/responsive/util/epg';
import { SUBSCRIPTION_REQUIRED_MODAL_ID } from 'toggle/responsive/util/subscriptionUtil';

import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import ReminderIcon from 'toggle/responsive/pageEntry/epg/ReminderIcon';
import ReminderSetIcon from 'toggle/responsive/pageEntry/epg/ReminderSetIcon';

import './ReminderComponent.scss';

const bem = new Bem('reminder');

interface ComponentProps {
	channel: api.ItemSummary;
	entryPoint: string;
	scheduleItem: api.ItemSchedule;
	epgItemState: EPG2ItemState;
	account: api.Account;
	date?: Date;
	isBackgroundWhite?: boolean;
}

interface StateProps {
	isAnonymous: boolean;
	reminderOffset: number | undefined;
	config: api.AppConfig;
	reminders: api.Reminder[] | undefined;
	currentPath: string;
}

interface DispatchProps {
	hideAllModals?: () => void;
	closeModal: (id: string) => void;
	addReminder: (body: api.ReminderRequest, options?: profile.AddReminderOptions, info?: any) => Promise<any>;
	deleteReminder: (reminderId: string) => Promise<any>;
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
	getRequiredModal: (onSignIn: () => void, onCancel: () => void) => void;
}

type Props = ComponentProps & DispatchProps & StateProps;

interface State {}

class ReminderComponent extends React.Component<Props, State> {
	shouldRenderReminder(): boolean {
		const { epgItemState, account, channel } = this.props;
		if (!isFutureState(epgItemState)) return false;
		if (!account) return true;

		return canPlay(channel);
	}

	render() {
		if (!this.shouldRenderReminder()) return null;

		const { scheduleItem, reminders, isBackgroundWhite } = this.props;
		const reminder = getReminder(scheduleItem, reminders);
		const onClick = reminder ? this.deleteReminder() : this.addReminder();
		const ordinal = isBackgroundWhite ? (reminder ? 'primary' : 'secondary') : 'naked';

		return (
			<div className={bem.b()}>
				<CtaButton className={bem.e('reminder-btn', { selected: !!reminder })} onClick={onClick} ordinal={ordinal}>
					{reminder ? <ReminderSetIcon /> : <ReminderIcon />}
					<IntlFormatter className={bem.e('texting')}>
						{reminder
							? '@{epg_schedule_detail_overlay_reminder_set|Reminder Set}'
							: '@{epg_schedule_detail_overlay_set_reminder|Set Reminder}'}
					</IntlFormatter>
				</CtaButton>
			</div>
		);
	}

	addReminder() {
		const {
			scheduleItem,
			reminders,
			addReminder,
			reminderOffset,
			isAnonymous,
			getRequiredModal,
			hideAllModals,
			showPassiveNotification
		} = this.props;
		const reminder = getReminder(scheduleItem, reminders);

		return (e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();

			if (isAnonymous) {
				hideAllModals();
				getRequiredModal(() => this.onSignInClick(scheduleItem), () => this.closeModal);
				return;
			}

			if (!reminder && !scheduleItem.isGap) {
				addReminder({ customId: scheduleItem.customId }).then(() =>
					showPassiveNotification(getReminderNotificationContent(reminderOffset))
				);
			}
		};
	}

	deleteReminder() {
		return (e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();

			const { scheduleItem, deleteReminder, reminders } = this.props;
			const reminder = getReminder(scheduleItem, reminders);
			deleteReminder(reminder.id);
		};
	}

	onSignInClick(scheduleItem: api.ItemSchedule) {
		const { config, hideAllModals, channel, date, currentPath } = this.props;
		hideAllModals();
		setReminderData({ scheduleItem, channel });
		saveChannel(channel);
		date && saveEPGDate(date);
		redirectToSignPage(config, currentPath);
	}

	closeModal() {
		const { closeModal } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	const { app, profile, page } = state;
	const { config } = app;
	const reminderOffset = get(app, 'config.linear.epgReminderNotificationOffsetMinutes');
	const reminders = profile && profile.reminders;
	return {
		isAnonymous: isAnonymousUser(state),
		reminderOffset,
		config,
		reminders,
		currentPath: page.history.location.pathname
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		hideAllModals: () => dispatch(HideAllModals()),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		addReminder: (body: api.ReminderRequest, options?: profile.AddReminderOptions, info?: any): Promise<any> =>
			dispatch(addReminder(body, options, info)),
		deleteReminder: (reminderId: string): Promise<any> =>
			dispatch(deleteReminder(reminderId, {}, { itemId: reminderId })),
		getRequiredModal: (onSignIn: () => void, onCancel: () => void) => {
			dispatch(OpenModal(getRequiredModalForAnonymous(onSignIn, onCancel)));
		},
		showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
			dispatch(ShowPassiveNotification(config))
	};
}

export default connect<StateProps, DispatchProps, ComponentProps>(
	mapStateToProps,
	mapDispatchToProps
)(wrapReminderCta(ReminderComponent));
