import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import {
	checkMaintenanceStatus,
	getSubscriptionDetails,
	subscriptionPaymentMethod
} from 'shared/account/accountWorkflow';
import { resolveImage } from 'shared/util/images';
import CtaButton from 'ref/responsive/component/CtaButton';
import Checkbox from 'ref/responsive/component/input/Checkbox';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Home, Watch, PricePlan } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Link } from 'react-router';
import ChoosePlanModal from '../../pageEntry/subscription/ChoosePlanModal';
import ModalTypes from 'shared/uiLayer/modalTypes';
import SubscriptionPlanPriceSummary from './SubscriptionPriceSummary';
import { openPricePlansModal, LAST_PAYMENT_RETURN_DATA_NAME } from '../../pageEntry/subscription/subscriptionsUtils';
import SubscriptionPaymentMethods from './SubscriptionPaymentMethods';
import {
	getPaymentMethods,
	makePurchase,
	deleteRememberCard,
	getAccount,
	getAccountUser,
	changeCreditCard
} from 'shared/service/action/account';
import {
	GetPaymentMethodsOptions,
	GetAccountUserOptions,
	MakePurchaseOptions,
	ChangeCreditCardOptions
} from 'shared/service/account';
import {
	PaymentMethods,
	findAvailablePaymentMethod,
	PaymentReturnData,
	isCardPayment,
	isTelcoPayment,
	CardOptions,
	getPaymentPageUrl
} from 'toggle/responsive/util/paymentUtil';
import { get } from 'shared/util/objects';
import { setItem } from 'shared/util/localStorage';
import { changeCardErrorModal, changeCardModal, CREDIT_CARD_MODAL_ID } from 'toggle/responsive/util/subscriptionUtil';
import { getLastPageInHistoryBeforeIgnored } from 'shared/page/pageUtil';
import { analyticsEvent, pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { subscriptionPaymentMethodPath, subscriptionPaymentSummaryPath } from 'shared/analytics/util/analyticsPath';
import { addQueryParameterToURL } from 'shared/util/urls';
import { browserHistory } from 'shared/util/browserHistory';
import { isValidOTP } from 'shared/account/accountUtil';
import AccountOTP from 'toggle/responsive/page/account/AccountOTP';

import './SubscriptionPlanSummary.scss';

const bem = new Bem('subscription-plan-summary');
const TERMS_OF_USE_PATH = process.env.CLIENT_MC_TERMS_OF_USE;

interface OwnProps extends PageEntryListProps {
	plan: api.SubscriptionPlan;
	selectedPricePlan: api.PricePlan;
	onUpdateSelectedPricePlan: (selectedPricePlan: api.PricePlan | undefined) => void;
	isPrimaryProfile: boolean;
	account: api.Account;
	location?: HistoryLocation;
	onSuccessPayment: () => void;
	onFailedPayment: () => void;
	onFailedFullDiscountPayment: () => void;
	skipTermsAndConditions?: boolean;
}

interface DispatchProps {
	showModal: (modal: ModalConfig) => any;
	makePurchase?: (body, options?: MakePurchaseOptions, info?: any) => Promise<any>;
	getUser: typeof getAccountUser;
	getPaymentMethods: (options?: GetPaymentMethodsOptions, info?: any) => Promise<any>;
	closeModal: (id: string) => any;
	deleteRememberCard?: () => Promise<any>;
	getSubscriptionDetails: typeof getSubscriptionDetails;
	getAccount: typeof getAccount;
	pageAnalyticsEvent: (path: string, originator?: any) => any;
	changeCreditCard: (body?: api.ChangeCreditCardRequest, options?: ChangeCreditCardOptions, info?: any) => Promise<any>;
	checkMaintenanceStatus: () => any;
	subscriptionPaymentMethod: (paymentMethod: string) => any;
	analyticsEvent: (type, payload?: any) => any;
}

interface StateProps {
	subscriptions: api.Subscription[];
	redirectPath?: string;
	homePath: string;
	pricePlanPath: string;
	rememberCard: boolean;
	config: state.Config;
}

type Props = OwnProps & DispatchProps & StateProps;

interface State {
	termsAndConditions: boolean;
	submitted: boolean;
	promoCode: string;
	showPaymentMethods: boolean;
	paymentMethods: api.PaymentMethod[];
	selectedCardId: string;
	paymentMethod: PaymentMethods;
	price: number | undefined;
	disabled: boolean;
	isShowOTP: boolean;
}

class SubscriptionPlanSummary extends React.Component<Props, State> {
	state: State = {
		termsAndConditions: false,
		submitted: false,
		promoCode: undefined,
		showPaymentMethods: false,
		paymentMethods: [],
		selectedCardId: undefined,
		paymentMethod: findAvailablePaymentMethod(this.props.selectedPricePlan.allowedPaymentMethods, PaymentMethods.CARD)
			? PaymentMethods.CARD
			: PaymentMethods.TELCO,
		price: undefined,
		disabled: false,
		isShowOTP: false
	};

	private subPlanPriceSummaryRef;

	componentDidMount() {
		const {
			location,
			getUser,
			selectedPricePlan,
			pageAnalyticsEvent,
			skipTermsAndConditions,
			getPaymentMethods
		} = this.props;

		getUser();

		if (skipTermsAndConditions) {
			this.setState({ termsAndConditions: true });
			this.onProceedToPayment(true);
		}

		const promoCode = get(location, 'query.promocode');
		if (promoCode) {
			this.setState({ promoCode: promoCode });
		}

		if (isValidOTP()) {
			getPaymentMethods().then(result => {
				const paymentMethods = get(result, 'payload.paymentMethods') || [];
				this.setState({
					paymentMethods
				});
			});
		}

		const analyticsPath = subscriptionPaymentSummaryPath(selectedPricePlan);
		if (analyticsPath) {
			pageAnalyticsEvent(analyticsPath, { pricePlan: selectedPricePlan });
		}

		document.addEventListener('visibilitychange', this.visibilityChange);
	}

	componentWillUnmount() {
		document.removeEventListener('visibilitychange', this.visibilityChange);
	}

	visibilityChange = () => {
		if (!document.hidden) {
			const { getUser } = this.props;
			getUser();
		}
	};

	componentDidUpdate(_: Props, oldState: State) {
		const { showPaymentMethods } = this.state;
		const { selectedPricePlan, pageAnalyticsEvent } = this.props;

		// The user has gone back to the summary page
		let analyticsPath: string;
		if (showPaymentMethods === false && oldState.showPaymentMethods === true) {
			analyticsPath = subscriptionPaymentSummaryPath(selectedPricePlan);
			if (analyticsPath) {
				pageAnalyticsEvent(analyticsPath, { pricePlan: selectedPricePlan });
			}
		}

		if (showPaymentMethods === true && oldState.showPaymentMethods === false) {
			analyticsPath = subscriptionPaymentMethodPath(selectedPricePlan);
			if (analyticsPath) {
				pageAnalyticsEvent(analyticsPath, { showPaymentMethods });
			}
		}
	}

	render() {
		const { plan, selectedPricePlan, rememberCard } = this.props;
		const { showPaymentMethods, paymentMethods, paymentMethod, promoCode, selectedCardId, isShowOTP } = this.state;

		return (
			<form className="form form-white">
				<div className={bem.b()}>
					{this.renderPackageSummary()}
					{isShowOTP && <AccountOTP key={'subscription'} onSuccessOTP={this.onSuccessOTP} />}
					{showPaymentMethods && (
						<div className={bem.e('payment-methods-summary')}>
							<SubscriptionPaymentMethods
								onChangeCardMethod={this.onChangeCardMethod}
								selectedCardId={selectedCardId}
								paymentMethods={paymentMethods}
								allowedPaymentMethods={selectedPricePlan.allowedPaymentMethods}
								paymentMethod={paymentMethod}
								onChangePaymentMethod={this.onChangePaymentMethod}
								rememberCard={rememberCard}
							/>
						</div>
					)}
					{!isShowOTP && (
						<div className={bem.e('promotion-price-summary')}>
							<SubscriptionPlanPriceSummary
								ref={(ref: any) => (this.subPlanPriceSummaryRef = ref && ref.getWrappedInstance())}
								openPricePlansModal={this.showModal}
								plan={plan}
								hidePromoCode={showPaymentMethods}
								selectedPricePlan={selectedPricePlan}
								onPromoCodeChange={this.onPromoCodeChange}
								promoCode={promoCode}
								setDiscountPrice={this.setDiscountPrice}
							/>
						</div>
					)}
				</div>
				{this.renderFooter()}
			</form>
		);
	}

	private onSuccessOTP = () => {
		this.props.getPaymentMethods().then(result => {
			const paymentMethods = result.payload.paymentMethods || [];
			this.setState({
				paymentMethods,
				submitted: true,
				showPaymentMethods: true,
				isShowOTP: false,
				disabled: false
			});
		});
	};

	setDiscountPrice = (price: number) => {
		this.setState({ price });
	};

	onPromoCodeChange = (promoCode: string) => {
		this.setState({ promoCode });
	};

	onChangePaymentMethod = (paymentMethod: PaymentMethods) => {
		this.setState({ paymentMethod });
	};

	onChangeCardMethod = (selectedCardId: string) => {
		this.setState({ selectedCardId });
	};

	renderTerms() {
		const { selectedPricePlan } = this.props;
		const { termsAndConditions } = selectedPricePlan;
		const normalizedTerms = termsAndConditions.split('\\n');

		return (
			termsAndConditions &&
			!this.state.showPaymentMethods && (
				<div className={bem.e('terms')}>
					<IntlFormatter elementType="div" className="title">
						{'@{subscription_summary_terms}'}
					</IntlFormatter>
					<ul>
						{normalizedTerms.map((item, i) => (
							<li className={bem.e('terms-item')} key={i}>
								{item}
							</li>
						))}
						<li className={bem.e('terms-item')}>
							<IntlFormatter>{'@{subscription_summary_terms_full}'}</IntlFormatter>
							<Link target="_blank" to={TERMS_OF_USE_PATH}>
								{TERMS_OF_USE_PATH}
							</Link>
						</li>
					</ul>
				</div>
			)
		);
	}

	renderPackageSummary() {
		const { list, title, plan } = this.props;
		const { isShowOTP } = this.state;
		const image = resolveImage(list.images, 'wallpaper', { width: 400 });

		return (
			<div className={bem.e('package-summary')}>
				<img className={bem.e('image')} src={image.src} alt="" />
				<div className={bem.e('container')}>
					<div className={bem.e('text')}>
						<div className="title">{title}</div>
						<div className="description">{plan.description}</div>
					</div>
					{!isShowOTP && this.renderTerms()}
				</div>
			</div>
		);
	}

	choosePlan = (pricePlan?: api.PricePlan) => {
		const { location, onUpdateSelectedPricePlan } = this.props;
		const query = Object.assign({}, get(location, 'query'));
		const selectedPricePlanId = get(query, 'selectedPricePlanId');

		if (selectedPricePlanId && selectedPricePlanId !== pricePlan.id) {
			query.selectedPricePlanId = pricePlan.id;
			browserHistory.replace(addQueryParameterToURL(location.pathname, query));
		}

		onUpdateSelectedPricePlan(pricePlan);
	};

	showModal = () => {
		const { plan, title, isPrimaryProfile, account, showModal, selectedPricePlan } = this.props;
		const props = openPricePlansModal(this.choosePlan, plan, title, isPrimaryProfile, account, selectedPricePlan);
		showModal({
			id: props.id,
			type: ModalTypes.CUSTOM,
			element: <ChoosePlanModal {...props} />,
			disableAutoClose: true
		});
	};

	skipPaymentStep() {
		const { promoCode, price, termsAndConditions } = this.state;
		const isRenewable = get(this.props, 'selectedPricePlan.isRenewable');
		return !isRenewable && promoCode && price === 0 && termsAndConditions;
	}

	renderFooter() {
		const { selectedPricePlan, checkMaintenanceStatus } = this.props;
		const { termsAndConditions, submitted, showPaymentMethods, disabled, promoCode } = this.state;

		const submitCallback = showPaymentMethods || this.skipPaymentStep() ? this.onSubmit : this.onProceedToPayment;
		const submitButtonAction = () => {
			if (promoCode && this.subPlanPriceSummaryRef) {
				this.subPlanPriceSummaryRef.applyPromocode(selectedPricePlan, promoCode, submitCallback);
				return;
			}

			checkMaintenanceStatus().then(action => {
				const maintenanceMode = get(action, 'payload.maintenanceMode');
				!maintenanceMode && submitCallback();
			});
		};

		return (
			<div>
				{!showPaymentMethods && (
					<IntlFormatter tagName="div" className="payment-info">
						{'@{subscription_summary_payment_info}'}
					</IntlFormatter>
				)}
				<div className="agree-terms">
					{!showPaymentMethods && (
						<Checkbox
							name="termsAndConditions"
							checked={termsAndConditions}
							className={bem.e('termsAndConditions')}
							onChange={this.onCheckboxChange}
							label="@{subscription_summary_agree_terms}"
							required={true}
							message={submitted && !termsAndConditions ? '@{subscription_summary_agree_terms_error_msg}' : ''}
						/>
					)}
				</div>
				<div className="buttons">
					<CtaButton ordinal="primary" className="proceed" onClick={submitButtonAction} disabled={disabled}>
						<IntlFormatter>
							{showPaymentMethods ? '@{subscription_summary_to_pay}' : '@{subscription_summary_proceed}'}
						</IntlFormatter>
					</CtaButton>

					<CtaButton ordinal="secondary" className="back" onClick={this.onCancel}>
						<IntlFormatter>{'@{button_label_back}'}</IntlFormatter>
					</CtaButton>
				</div>
			</div>
		);
	}

	onProceedToPayment = (skipTermsAndConditions?: boolean) => {
		window.scrollTo({ top: 0 });
		const { termsAndConditions } = this.state;
		const { analyticsEvent } = this.props;
		const _isValidOtp = isValidOTP();

		if (termsAndConditions) analyticsEvent(AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAYMENT);
		const newState = {
			submitted: true,
			showPaymentMethods: false,
			isShowOTP: false,
			disabled: false
		};

		if (skipTermsAndConditions || termsAndConditions) {
			if (_isValidOtp) {
				newState.showPaymentMethods = true;
			} else {
				newState.isShowOTP = true;
				newState.disabled = true;
			}
		}

		this.setState(newState);
	};

	onSubmit = () => {
		const { homePath, selectedPricePlan, redirectPath, analyticsEvent, subscriptionPaymentMethod } = this.props;
		const { promoCode, paymentMethod, price, selectedCardId } = this.state;
		const card = isCardPayment(paymentMethod);
		const returnData: PaymentReturnData = {
			paymentType: paymentMethod,
			path: redirectPath || homePath,
			packageId: selectedPricePlan.id,
			packageName: selectedPricePlan.name,
			promoCode,
			totalPrice: price,
			entitlementValidated: false
		};
		subscriptionPaymentMethod(paymentMethod);
		analyticsEvent(AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAY);
		this.setButtonState(true);

		setItem(LAST_PAYMENT_RETURN_DATA_NAME, returnData);

		const purchaseData: api.PurchaseRequest = {
			subscriptionId: selectedPricePlan.id,
			paymentType: card ? PaymentMethods.CARD : PaymentMethods.TELCO,
			promocode: promoCode
		};

		if (card && selectedCardId !== CardOptions.NEW) {
			purchaseData.paymentMethodId = selectedCardId;
		}

		const paymentPageData = {
			purchaseData,
			plan: selectedPricePlan.name,
			price: typeof price === 'undefined' ? selectedPricePlan.price : price
		};

		if (this.skipPaymentStep()) {
			this.executePurchase(paymentPageData);
			return;
		}

		if (isCardPayment(paymentMethod)) {
			this.purchaseWithCreditCard(paymentPageData);
		}

		if (isTelcoPayment(paymentMethod)) {
			this.purchaseWithTelco(purchaseData);
		}
	};

	purchaseWithCreditCard(paymentPageData) {
		const { selectedCardId } = this.state;

		if (selectedCardId === CardOptions.NEW) {
			const modalProps = changeCardModal(
				() => {
					this.onConfirmChangingCard(paymentPageData);
				},
				() => {
					this.setButtonState(false);
				}
			);
			this.openModal(modalProps);
		} else {
			this.executePurchase(paymentPageData);
		}
	}

	purchaseWithTelco(paymentPageData) {
		this.executePurchase(paymentPageData);
	}

	onConfirmChangingCard = paymentPageData => {
		const { closeModal, analyticsEvent } = this.props;
		analyticsEvent(AnalyticsEventType.SUBSCRIBE_CONFIRM_AND_PROCEED);
		closeModal(CREDIT_CARD_MODAL_ID);
		this.executePurchase(paymentPageData);
	};

	executePurchase(paymentPageData) {
		const { purchaseData } = paymentPageData;
		const { onSuccessPayment, makePurchase, getSubscriptionDetails, getAccount, pricePlanPath } = this.props;

		makePurchase(purchaseData)
			.then(res => {
				const { error, payload } = res;
				this.setButtonState(false);

				if (error) {
					return this.renderError();
				}

				const { sessionData, sessionId } = payload;
				if (sessionData && sessionId) {
					const paymentPageUrl = getPaymentPageUrl({ ...paymentPageData, pricePlanPath, sessionId, sessionData });
					return window.open(paymentPageUrl, '_self');
				}

				getAccount();
				getSubscriptionDetails();
				onSuccessPayment();
			})
			.catch(e => this.renderError());
	}

	renderError() {
		const { onFailedPayment, onFailedFullDiscountPayment } = this.props;
		if (this.skipPaymentStep()) {
			onFailedFullDiscountPayment();
			return;
		}
		this.setButtonState(false);
		const modalProps = changeCardErrorModal(onFailedPayment);
		this.openModal(modalProps);
	}

	setButtonState(disabled: boolean) {
		this.setState({ disabled });
	}

	openModal(modalProps) {
		this.props.showModal({
			...modalProps,
			type: ModalTypes.CONFIRMATION_DIALOG
		});
	}

	onCancel = () => {
		window.scrollTo({ top: 0 });

		if (this.state.showPaymentMethods) {
			this.goToPackageSummary();
			return;
		}

		this.props.onUpdateSelectedPricePlan(undefined);
	};

	onCheckboxChange = e => {
		this.setState((prevState: State) => ({ termsAndConditions: !prevState.termsAndConditions, submitted: false }));
	};

	goToPackageSummary() {
		this.setState({ showPaymentMethods: false });
	}
}

const ignoredPageKeys = [PricePlan, Watch];

function mapStateToProps(state: state.Root): StateProps {
	const { app, account } = state;
	const { config } = app;
	const rememberCard = get(account, 'paymentData.rememberCard');
	const entries = get(state.page, 'history.entries');
	let redirectPath = getLastPageInHistoryBeforeIgnored(entries, config, ignoredPageKeys);

	return {
		redirectPath,
		rememberCard,
		homePath: getPathByKey(Home, config),
		pricePlanPath: getPathByKey(PricePlan, config),
		subscriptions: get(account, 'subscriptionDetails'),
		config: app.config
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		showModal: (modalProps: ModalConfig) => dispatch(OpenModal(modalProps)),
		getUser: (options?: GetAccountUserOptions, info?: any) => dispatch(getAccountUser(options, info)),
		getPaymentMethods: (options?: GetPaymentMethodsOptions, info?: any) => dispatch(getPaymentMethods(options, info)),
		makePurchase: (body: api.PurchaseRequest, options?: MakePurchaseOptions, info?: any) =>
			dispatch(makePurchase(body, options, info)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		deleteRememberCard: () => dispatch(deleteRememberCard()),
		getSubscriptionDetails: () => dispatch(getSubscriptionDetails()),
		getAccount: () => dispatch(getAccount()),
		pageAnalyticsEvent: (path: string, originator?: any) => dispatch(pageAnalyticsEvent(path, originator)),
		changeCreditCard: (body?: api.ChangeCreditCardRequest, options?: ChangeCreditCardOptions, info?: any) =>
			dispatch(changeCreditCard(body, options, info)),
		checkMaintenanceStatus: () => dispatch(checkMaintenanceStatus()),
		subscriptionPaymentMethod: paymentMethod => dispatch(subscriptionPaymentMethod(paymentMethod)),
		analyticsEvent: (type, payload?: any) => dispatch(analyticsEvent(type, { payload }))
	};
}

const Component: any = connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(SubscriptionPlanSummary);

export default Component;
