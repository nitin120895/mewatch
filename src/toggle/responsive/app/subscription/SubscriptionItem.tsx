import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { FormattedDate } from 'react-intl';
import { cancelSubscription, getAccount } from 'shared/service/action/account';
import { Bem } from 'shared/util/styles';
import { resolveImage } from 'shared/util/images';
import { get } from 'shared/util/objects';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { getSubscriptionDetails } from 'shared/account/accountWorkflow';
import { DAY_IN_MILISECONDS } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import ModalTypes from 'shared/uiLayer/modalTypes';
import Tooltip from 'toggle/responsive/component/Tooltip';
import PackageModal from 'toggle/responsive/app/subscription/PackageModal';
import {
	unsuccessfulCancelSubscriptionModal,
	regularCancelSubscriptionModal,
	successfulCancelSubscriptionModal,
	CANCEL_SUBSCRIPTION_MODAL_ID,
	getPackageIds
} from 'toggle/responsive/util/subscriptionUtil';
import { redirectToResubscribe } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import {
	checkPaymentMethodForCancel,
	PaymentMethods,
	inAppPurchaseSubscription,
	PaymentMethodsTitleMap,
	isTelcoPayment
} from 'toggle/responsive/util/paymentUtil';

import './SubscriptionItem.scss';

const dateLabels = {
	RENEW: '@{subscription_renews_on_date_label}',
	CANCELLED: '@{subscription_cancel_by_label}',
	EXPIRES: '@{subscription_expires_label}',
	EXPIRED: '@{account.billing.expired.label}'
};

const PACKAGE_MODAL_ID = 'package-modal';
const bem = new Bem('active-subscription-item');

interface ModalProps {
	image?: string;
	description?: string;
	name?: string;
	onCancel: () => void;
}

export interface ActiveSubscriptionProps extends api.SubscriptionDetail {
	list?: api.ItemList;
	price: string;
	paymentMethod: string;
}

interface OwnProps {
	isPrimaryProfile: boolean;
	plan: ActiveSubscriptionProps;
	expired: boolean;
	fromAccount?: boolean;
}

interface StateProps {
	config: state.Config;
}

interface DispatchProps {
	closeModal: (id: string) => void;
	openModal: (modal: ModalConfig) => void;
	cancelSubscription: (id: string) => Promise<any>;
	getAccount: () => Promise<any>;
	getSubscriptionDetails: typeof getSubscriptionDetails;
}

type Props = OwnProps & StateProps & DispatchProps;

class SubscriptionItem extends React.Component<Props> {
	getImageForActivePlan() {
		const { image, list } = this.props.plan;
		return image || (list && resolveImage(list.images, 'hero3x1', { width: 160 }).src);
	}

	getCancelByDate(nextRenewalDate: string | Date) {
		const renewTime = new Date(nextRenewalDate).getTime();
		const cancelDate = new Date(renewTime - DAY_IN_MILISECONDS);
		return this.renderDate(cancelDate, dateLabels.CANCELLED);
	}

	isCancelledSubscription() {
		const { isPrimaryProfile, plan } = this.props;
		const { isCancellationEnabled, isRenewable } = plan;
		return !isCancellationEnabled && isRenewable && isPrimaryProfile;
	}

	render() {
		const imageSrc = this.getImageForActivePlan();

		return (
			<div className={bem.b()}>
				<img onClick={this.showModal} src={imageSrc} />
				{this.renderContentSection()}
				{this.renderActions()}
			</div>
		);
	}

	renderTooltip(paymentMethod) {
		const helpTooltipMsg =
			paymentMethod === PaymentMethods.TELCO ? (
				<IntlFormatter>{'@{subscription_payment_telco_tooltip}'}</IntlFormatter>
			) : (
				<IntlFormatter>{'@{subscription_payment_in_app_tooltip}'}</IntlFormatter>
			);
		return (
			<Tooltip className={bem.e('tooltip')} text={helpTooltipMsg}>
				<span className={bem.e('hint-icon')} />
			</Tooltip>
		);
	}

	renderContentSection() {
		const { isPrimaryProfile, expired } = this.props;
		const {
			name,
			nextRenewalDate,
			endDate,
			isCancellationEnabled,
			recurringCost: recurringCostToFormat,
			isRenewable
		} = this.props.plan;
		const isCancelled = this.isCancelledSubscription();
		const renewable = isPrimaryProfile && isRenewable && nextRenewalDate && isCancellationEnabled && !expired;
		const recurringCost = typeof recurringCostToFormat !== 'undefined' ? recurringCostToFormat.toFixed(2) : undefined;

		return (
			<div className={bem.e('content-section')}>
				<div onClick={this.showModal} className={bem.e('title')}>
					{name}
				</div>
				{!expired && isRenewable && !isCancelled && recurringCost && (
					<IntlFormatter values={{ recurringCost }} className={bem.e('price')}>
						{'@{subscription_price_info}'}
					</IntlFormatter>
				)}
				{expired && this.renderDate(endDate, dateLabels.EXPIRED)}
				{renewable && this.renderDate(nextRenewalDate, dateLabels.RENEW)}
			</div>
		);
	}

	renderActions() {
		const { isPrimaryProfile, plan, expired, config } = this.props;
		const {
			nextRenewalDate,
			isCancellationEnabled,
			endDate,
			canResubscribe,
			paymentMethod,
			isRenewable,
			planId
		} = plan;
		const showCancelButton =
			!expired &&
			isPrimaryProfile &&
			isRenewable &&
			isCancellationEnabled &&
			checkPaymentMethodForCancel(paymentMethod);
		const repurchaseButtonEnable = expired && isPrimaryProfile && canResubscribe;
		const tooltip = inAppPurchaseSubscription(paymentMethod) || isTelcoPayment(paymentMethod as PaymentMethods);
		const isCancelled = this.isCancelledSubscription();
		const shouldRenderExpiryDate = !isRenewable || isCancelled;
		const unavailablePackage = expired && !canResubscribe;

		const isPaymentMethodAvailable = !!PaymentMethodsTitleMap[paymentMethod];

		const cessationProvidersDetails = get(config, 'general.customFields.CessationProviderDetails');
		// Get the cessation PlanIds
		const cessationPlanIds = getPackageIds(cessationProvidersDetails);

		// If the planId is found in cessationProvidersDetails packageIDs and
		// repurchaseButtonEnable is true, the subscribe button will be disabled with grayed-out text.
		const isExpiredSubscription = cessationPlanIds && cessationPlanIds.includes(planId) && repurchaseButtonEnable;

		return (
			<div className={bem.e('actions')}>
				{showCancelButton && (
					<IntlFormatter
						elementType={CtaButton}
						onClick={this.onCancelSubscriptionClicked}
						componentProps={{ ordinal: 'naked', theme: 'light' }}
					>
						{'@{account_common_cancel_button_label}'}
					</IntlFormatter>
				)}
				{repurchaseButtonEnable && (
					<IntlFormatter
						elementType={CtaButton}
						onClick={isExpiredSubscription ? () => {} : this.onResubscribeClicked}
						componentProps={{
							ordinal: 'naked',
							theme: 'light',
							disabled: isExpiredSubscription
						}}
					>
						{'@{subscriptions_subscribe_section_subscribe|Subscribe}'}
					</IntlFormatter>
				)}
				{!inAppPurchaseSubscription(paymentMethod) && !expired && (
					<div className={cx('actions-container', { cancelable: !isCancelled })}>
						{isCancelled && (
							<IntlFormatter className={bem.e('cancelled')}>{'@{subscription_cancelled_label}'}</IntlFormatter>
						)}
						{nextRenewalDate && showCancelButton && this.getCancelByDate(nextRenewalDate)}
						{shouldRenderExpiryDate && this.renderDate(endDate, dateLabels.EXPIRES)}
					</div>
				)}
				{isPrimaryProfile && (
					<div className={bem.e('purchase')}>
						{tooltip && this.renderTooltip(paymentMethod)}
						{isPaymentMethodAvailable && <IntlFormatter>{PaymentMethodsTitleMap[paymentMethod]}</IntlFormatter>}
					</div>
				)}
				{unavailablePackage && (
					<IntlFormatter className={bem.e('unavailable')}>{'@{subscriptions_no_available_package}'}</IntlFormatter>
				)}
			</div>
		);
	}

	renderDate = (nextRenewalDate: string | Date, label: string) => {
		return (
			<div className={bem.e('date')}>
				<IntlFormatter>{label}</IntlFormatter> <FormattedDate value={nextRenewalDate} day="2-digit" />
				{'/'}
				<FormattedDate value={nextRenewalDate} month="2-digit" />
				{'/'}
				{label === dateLabels.RENEW ? (
					<FormattedDate value={nextRenewalDate} year="numeric" />
				) : (
					<FormattedDate value={nextRenewalDate} year="2-digit" />
				)}
			</div>
		);
	};

	showModal = () => {
		const { plan, openModal } = this.props;
		const { name, description } = plan;
		const props: ModalProps = {
			name,
			description,
			image: this.getImageForActivePlan(),
			onCancel: this.onModalClose
		};

		openModal({
			id: PACKAGE_MODAL_ID,
			type: ModalTypes.CUSTOM,
			element: <PackageModal {...props} />
		});
	};

	onModalClose = () => {
		this.props.closeModal(PACKAGE_MODAL_ID);
	};

	onCancelSubscriptionClicked = () => {
		const { plan, openModal } = this.props;
		openModal(regularCancelSubscriptionModal(this.onConfirmCancelSubscription, plan));
	};

	onResubscribeClicked = () => {
		const { plan, config } = this.props;
		redirectToResubscribe(plan, config);
	};

	onConfirmCancelSubscription = () => {
		const { plan, openModal, closeModal, cancelSubscription, getAccount, getSubscriptionDetails } = this.props;

		closeModal(CANCEL_SUBSCRIPTION_MODAL_ID);

		cancelSubscription(plan.planId).then(res => {
			if (res.error) {
				openModal(unsuccessfulCancelSubscriptionModal());
			} else {
				getAccount();
				getSubscriptionDetails();
				openModal(successfulCancelSubscriptionModal());
			}
		});
	};
}

function mapStateToProps(state: state.Root): StateProps {
	return {
		config: state.app.config
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		cancelSubscription: (id: string) => dispatch(cancelSubscription(id)),
		getAccount: () => dispatch(getAccount()),
		getSubscriptionDetails: () => dispatch(getSubscriptionDetails())
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(SubscriptionItem);
