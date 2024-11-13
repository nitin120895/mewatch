import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import Spinner from 'ref/responsive/component/Spinner';
import { Bem } from 'shared/util/styles';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { noop } from 'shared/util/function';
import { get } from 'shared/util/objects';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import {
	changeCreditCard,
	deleteRememberCard,
	deleteCreditCard,
	getPaymentMethods
} from 'shared/service/action/account';
import { ChangeCreditCardOptions, DeleteCreditCardOptions } from 'shared/service/account';
import { setItem } from 'shared/util/localStorage';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { AccountBilling, PricePlan as PricePlanPageKey } from 'shared/page/pageKey';
import { getActiveSubscriptions } from 'toggle/responsive/pageEntry/account/accountUtils';
import {
	filterCards,
	getAccountTelcoPayments,
	getAccountInAppPayments,
	isCardDetailsSaved,
	isOnlyAccountTelcoOrInAppPayments,
	PaymentMethods as paymentMethodsType,
	setChangeChangeCardReturnData,
	PaymentReturnData,
	getLastUsedExternalID,
	getChangeCardPageUrl
} from 'toggle/responsive/util/paymentUtil';
import {
	changeCardModal,
	CREDIT_CARD_MODAL_ID,
	failedCardRemoval,
	newCreditCardModal,
	REMOVE_CARD_MODAL_ID,
	removeCardErrorModal,
	removeCardModal,
	successfulCardRemoval
} from 'toggle/responsive/util/subscriptionUtil';
import { LAST_PAYMENT_RETURN_DATA_NAME } from '../../../subscription/subscriptionsUtils';
import PaymentCardDetails from 'toggle/responsive/pageEntry/account/a2/components/PaymentCardDetails';
import { browserHistory } from 'shared/util/browserHistory';
import { PaymentMethods as PayMethod } from 'toggle/responsive/util/paymentUtil';
import { PaymentConfirmationOverlayProps } from 'toggle/responsive/app/subscription/PaymentConfirmationOverlay';
import { checkMaintenanceStatus } from 'shared/account/accountWorkflow';

import './PaymentMethods.scss';

interface DispatchProps {
	getPaymentMethods: () => void;
	deleteRememberCard?: () => Promise<any>;
	deleteCreditCard?: (body: api.DeleteCreditCardRequest, options?: DeleteCreditCardOptions, info?: any) => Promise<any>;
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string | number) => void;
	changeCreditCard: (body: api.ChangeCreditCardRequest, options?: ChangeCreditCardOptions, info?: any) => Promise<any>;
	checkMaintenanceStatus: () => any;
}

interface StateProps {
	paymentMethods: api.PaymentMethod[];
	activeSubscriptions: api.SubscriptionDetail[];
	config: state.Config;
	rememberCard: boolean;
	purchases: api.PurchaseExtended[];
	pricePlanPath: string;
}

interface OwnProps {
	defaultPaymentMethodId?: string;
	setOverlayMessage?: (props: PaymentConfirmationOverlayProps) => void;
}

interface State {
	loading: boolean;
}

type PaymentMethodsProps = DispatchProps & StateProps & OwnProps;

const bem = new Bem('payment-methods');

export class PaymentMethods extends React.Component<PaymentMethodsProps, State> {
	static defaultProps = {
		getPaymentMethods: noop,
		paymentMethods: [],
		activeSubscriptions: []
	};

	state: State = {
		loading: false
	};

	componentDidMount() {
		this.props.getPaymentMethods();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.paymentMethods.length && !nextProps.paymentMethods.length) {
			this.setState({ loading: false });
		}
	}

	failedCardRemoval() {
		const modalProps = failedCardRemoval();
		this.openModal(modalProps);
	}

	removeCard = (method: api.PaymentMethod) => {
		const modalProps = removeCardModal(() => this.confirmedCardRemoving(method));
		this.openModal(modalProps);
	};

	removeSavedCard = () => {
		const modalProps = removeCardModal(this.confirmedSavedCardRemoving);
		this.openModal(modalProps);
	};

	changeCard = () => {
		let modalProps: Partial<ModalConfig>;

		setChangeChangeCardReturnData(getPathByKey(AccountBilling, this.props.config));

		this.props.checkMaintenanceStatus().then(action => {
			const maintenanceMode = get(action, 'payload.maintenanceMode');
			if (maintenanceMode) {
				browserHistory.push(getPathByKey(PricePlanPageKey, this.props.config));
				return;
			}
			if (isCardDetailsSaved(this.props.paymentMethods)) {
				modalProps = changeCardModal(this.onConfirmChangingCard);
			} else {
				modalProps = newCreditCardModal(this.onConfirmChangingCard);
			}

			this.openModal(modalProps);
		});
	};

	onConfirmChangingCard = () => {
		const externalId = getLastUsedExternalID(this.props.paymentMethods);
		if (!externalId) return;
		const { changeCreditCard, pricePlanPath } = this.props;
		this.props.closeModal(CREDIT_CARD_MODAL_ID);

		changeCreditCard({ externalId }).then(res => {
			const { error, payload } = res;
			const { sessionData, sessionId } = payload;
			if (error) return this.renderError();
			if (sessionData && sessionId) {
				const changeCardPageUrl = getChangeCardPageUrl({ sessionId, sessionData, pricePlanPath });
				return window.open(changeCardPageUrl, '_self');
			}
		});
	};

	renderError() {
		const modalProps = removeCardErrorModal(() => noop);
		this.openModal(modalProps);
	}

	openModal(modalProps) {
		const { id, componentProps } = modalProps;

		this.props.showModal({
			id,
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps
		});
	}

	confirmedSavedCardRemoving = (): void => {
		const { deleteRememberCard, getPaymentMethods, closeModal } = this.props;
		this.setState({ loading: true });

		deleteRememberCard()
			.then(() => {
				getPaymentMethods();
			})
			.catch(() => {
				this.failedCardRemoval();
				this.setState({
					loading: false
				});
			})
			.finally(() => {
				closeModal(REMOVE_CARD_MODAL_ID);
				this.setState({ loading: false });
			});
	};

	confirmedCardRemoving = (method: api.PaymentMethod): void => {
		const { deleteCreditCard, getPaymentMethods, closeModal } = this.props;
		this.setState({ loading: true });

		const data: PaymentReturnData = {
			paymentType: PayMethod.CARD,
			path: getPathByKey(AccountBilling, this.props.config),
			removeCard: true,
			totalPrice: 0
		};
		setItem(LAST_PAYMENT_RETURN_DATA_NAME, data);

		deleteCreditCard({ paymentMethodId: method.id })
			.then(res => {
				const { result } = res.payload;
				if (result) {
					this.props.setOverlayMessage(successfulCardRemoval());
				} else {
					this.failedCardRemoval();
				}
				getPaymentMethods();
			})
			.catch(() => {
				this.failedCardRemoval();
				this.setState({
					loading: false
				});
			})
			.finally(() => {
				closeModal(REMOVE_CARD_MODAL_ID);
				this.setState({ loading: false });
			});
	};

	hasChangeCard(): boolean {
		const { activeSubscriptions, rememberCard } = this.props;
		const hasActiveSubsriptions = activeSubscriptions && activeSubscriptions.length > 0;

		return (rememberCard || hasActiveSubsriptions) && this.showCardDetails();
	}

	showCardDetails(): boolean {
		const { activeSubscriptions, rememberCard } = this.props;
		const isOnlyTelcoOrInAppPayment = isOnlyAccountTelcoOrInAppPayments(activeSubscriptions);
		const isOnlyComplimentarySubscription = this.onlyHasRecurringCostSubscriptions();

		return (
			rememberCard || (activeSubscriptions.length && !(isOnlyTelcoOrInAppPayment || isOnlyComplimentarySubscription))
		);
	}

	hasSavedCardDetails(): boolean {
		return !!this.props.paymentMethods.length;
	}

	render() {
		const { loading } = this.state;
		const { paymentMethods } = this.props;
		return (
			<AccountEntryWrapper
				title={'@{account.billing.paymentMethods|Payment Methods}'}
				buttonLabel={this.hasChangeCard() ? '@{account.billing.changeCard|Change Card}' : ''}
				onClick={this.hasChangeCard() ? this.changeCard : undefined}
				hideButton={!paymentMethods || paymentMethods.length === 0}
			>
				{loading && this.renderSpinner()}
				{!loading && this.renderPaymentMethods()}
			</AccountEntryWrapper>
		);
	}

	renderSpinner() {
		return (
			<div className={bem.b('spinner')}>
				<Spinner className={bem.e('spinner')} />
			</div>
		);
	}

	private getPaymentDetailsTitleMessage(): string {
		const { activeSubscriptions, rememberCard } = this.props;
		const isOnlyTelcoOrInAppPayment = isOnlyAccountTelcoOrInAppPayments(activeSubscriptions);
		const allGifts = this.zeroRecurringCostSubscriptions();
		const isOnlyComplimentarySubscription = allGifts && allGifts.length;
		const isOnlyNonRecurringSubscription = this.onlyHasRecurringCostSubscriptions();

		if (isOnlyTelcoOrInAppPayment) {
			return '@{account_a2_only_telco_payment_description_text}';
		}

		if (isOnlyComplimentarySubscription && !rememberCard) {
			return '@{account_a2_complimentary_message}';
		}

		if (isOnlyNonRecurringSubscription && !rememberCard) {
			return '@{account_a2_non_recurring_message}';
		}

		if (!activeSubscriptions.length) {
			return '@{account_a2_no_active_subscription_text}';
		}

		if (rememberCard) {
			return '@{account_a2_credit_card_remembered_description_text}';
		}

		return '@{account_a2_credit_card_description_text}';
	}

	private renderPaymentDetailsTitle() {
		const message = this.getPaymentDetailsTitleMessage();

		return (
			message && (
				<div className={bem.e('no-method')}>
					<IntlFormatter elementType="div" className={bem.e('message')}>
						{message}
					</IntlFormatter>
				</div>
			)
		);
	}

	renderPaymentMethods() {
		const { paymentMethods, rememberCard } = this.props;
		const hasPaymentMethod = this.hasSavedCardDetails();
		const renderCardDetails = hasPaymentMethod && this.showCardDetails();

		return (
			<div>
				{this.renderPaymentDetailsTitle()}
				{!!renderCardDetails && (
					<div className={bem.b()}>
						<div className="methods">
							{hasPaymentMethod && <PaymentCardDetails key={0} card={paymentMethods[paymentMethods.length - 1]} />}
							{rememberCard && (
								<IntlFormatter className={bem.e('description')}>
									{'@{account_a2_credit_card_remembered_text}'}
								</IntlFormatter>
							)}
						</div>
						{rememberCard && this.renderRemoveSavedCardButton()}
					</div>
				)}
				{this.renderTelcoOrInAppMessage()}
				{this.renderComplimentaryMessage()}
			</div>
		);
	}

	private renderTelcoOrInAppMessage() {
		const { activeSubscriptions } = this.props;
		const isTelcoPayment = getAccountTelcoPayments(activeSubscriptions);
		const isInAppPayment = getAccountInAppPayments(activeSubscriptions);

		if (!isTelcoPayment && !isInAppPayment) return;

		return (
			<div className={bem.e('messages-container')}>
				{isInAppPayment && (
					<IntlFormatter elementType="div" className={bem.e('message')}>
						{'@{account_a2_inapp_message}'}
					</IntlFormatter>
				)}
				{isTelcoPayment && (
					<IntlFormatter elementType="div" className={bem.e('message')}>
						{'@{account_a2_telco_message}'}
					</IntlFormatter>
				)}
			</div>
		);
	}

	private renderComplimentaryMessage() {
		const complimentarySubscriptions = this.zeroRecurringCostSubscriptions();
		const isOnlyComplimentarySubscription = this.onlyHasRecurringCostSubscriptions();

		if (!complimentarySubscriptions.length || isOnlyComplimentarySubscription) return;

		return (
			<div className={bem.e('messages-container')}>
				<IntlFormatter elementType="div" className={bem.e('message')}>
					{'@{account_a2_complimentary_message}'}
				</IntlFormatter>
			</div>
		);
	}

	private zeroRecurringCostSubscriptions(): api.SubscriptionDetail[] {
		const { activeSubscriptions, purchases } = this.props;
		const giftIds = purchases
			.filter(purchase => get(purchase, 'paymentMethod.type') === paymentMethodsType.GIFT)
			.map(purchase => purchase.id);

		return activeSubscriptions.filter(sub => Math.ceil(sub.recurringCost) === 0 || giftIds.includes(sub.id));
	}

	private onlyHasRecurringCostSubscriptions(): boolean {
		const { activeSubscriptions, purchases } = this.props;

		if (!activeSubscriptions.length) return false;
		return (
			activeSubscriptions.every(sub => !sub.isRenewable) ||
			purchases.every(purchase => get(purchase, 'paymentMethod.type') === paymentMethodsType.GIFT)
		);
	}

	private renderRemoveSavedCardButton() {
		const savedCard = this.hasSavedCardDetails();
		return (
			savedCard && (
				<CtaButton className={bem.e('remove-card')} ordinal="naked" theme="light" onClick={this.removeSavedCard}>
					<SVGPathIcon
						fill="none"
						className={'svg-icon'}
						data={'M0 0l6 5.933L12 0M12 11.933L6 6l-6 5.933'}
						viewBox={{ width: 12, height: 12 }}
						width="12px"
						height="12px"
					/>
					<IntlFormatter>{'@{account.billing.removeCard}'}</IntlFormatter>
				</CtaButton>
			)
		);
	}
}

function mapStateToProps({ account, app }: state.Root): StateProps {
	const paymentMethods = get(account, 'paymentData.paymentMethods') || [];
	const rememberCard = get(account, 'paymentData.rememberCard');
	const subscriptions = get(account, 'subscriptionDetails');
	const purchases = get(account, 'purchases.items') || [];

	return {
		config: app.config,
		paymentMethods: filterCards(paymentMethods),
		activeSubscriptions: getActiveSubscriptions(subscriptions),
		pricePlanPath: getPathByKey(PricePlanPageKey, app.config),
		rememberCard,
		purchases
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getPaymentMethods: () => dispatch(getPaymentMethods()),
		deleteRememberCard: () => dispatch(deleteRememberCard()),
		deleteCreditCard: (body?: api.DeleteCreditCardRequest, options?: DeleteCreditCardOptions, info?: any) =>
			dispatch(deleteCreditCard(body, options, info)),
		showModal: (modalProps: ModalConfig) => dispatch(OpenModal(modalProps)),
		closeModal: (id: string | number) => dispatch(CloseModal(id)),
		changeCreditCard: (body: api.ChangeCreditCardRequest, options?: ChangeCreditCardOptions, info?: any) =>
			dispatch(changeCreditCard(body, options, info)),
		checkMaintenanceStatus: () => dispatch(checkMaintenanceStatus())
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(PaymentMethods);
