import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { browserHistory } from 'shared/util/browserHistory';
import { Subscription as template } from 'shared/page/pageTemplate';
import { REMOVE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import SubscriptionPlanSummary from '../../app/subscription/SubscriptionPlanSummary';
import configAccountPage, { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { filterSubscriptionEntries, openErrorModal } from '../../pageEntry/utils/filterSubscriptions';
import WarningIcon from '../../component/icons/WarningIcon';
import CtaButton from 'ref/responsive/component/CtaButton';
import {
	conflictingCancelSubscriptionModal,
	CANCEL_SUBSCRIPTION_MODAL_ID,
	unsuccessfulCancelSubscriptionModal,
	successfulCancelSubscriptionFromConflictModal,
	showRememberCardModal,
	getPaymentOverlayData,
	REMEMBER_CARD_MODAL_ID,
	successfulCardChange,
	unsuccessfulCardChange,
	getPackageIds
} from 'toggle/responsive/util/subscriptionUtil';
import {
	cancelSubscription,
	setRememberCard,
	getPaymentMethods,
	deleteRememberCard,
	getAccountSubscriptionPricePlanPrices,
	getAccount
} from 'shared/service/action/account';
import {
	getPriceInfo,
	getSubscriptionSummaryPage,
	LAST_PAYMENT_RETURN_DATA_NAME
} from '../../pageEntry/subscription/subscriptionsUtils';
import { get } from 'shared/util/objects';
import { SX1ActiveSubscription, SX2SubscriptionPlan, H10Text as H10Template } from 'shared/page/pageEntryTemplate';
import { getPathByKey, getSignInPath } from 'shared/page/sitemapLookup';
import { PricePlan as PricePlanPageKey, AccountBilling } from 'shared/page/pageKey';
import PaymentConfirmationOverlay, {
	PaymentConfirmationOverlayProps
} from '../../app/subscription/PaymentConfirmationOverlay';
import { PaymentMethods, PaymentSuccessStatusMap, getPaymentReturnData } from '../../util/paymentUtil';
import Spinner from 'ref/responsive/component/Spinner';
import { parseQueryParams } from 'ref/responsive/util/browser';
import { setItem } from 'shared/util/localStorage';
import AlertModal from '../../component/dialog/AlertModal';
import {
	checkMaintenanceStatus,
	getSubscriptionDetails,
	selectPricePlan,
	updateEntitlements
} from 'shared/account/accountWorkflow';
import { analyticsEvent, pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { subscriptionPaymentSuccessPath, subscriptionPaymentFailedPath } from 'shared/analytics/util/analyticsPath';
import entryRenderers from './subscriptionEntries';
import { showToastNotifications, hideToastNotifications } from 'toggle/responsive/util/modalUtil';
import { addQueryParameterToURL } from 'shared/util/urls';
import Maintenance from '../Maintenance';
import { setAppTheme } from 'shared/app/appWorkflow';

import './Subscriptions.scss';

const bem = new Bem('pg-subscriptions');
const bemConflict = new Bem('pg-subscriptions--conflict');

interface State {
	selectedSubscription: api.SubscriptionPlan | undefined;
	selectedPricePlan: api.PricePlan | undefined;
	itemList: api.ItemList;
	itemTitle: string;
	filteredSubscriptionIds: string[];
	canceledActiveSubscription: boolean;
	showPaymentOverlay: boolean;
	isSuccessfulPayment: boolean;
	loading: boolean;
	showLoadingScreen: boolean;
	isFullDiscountSubscription: boolean;
	showPartnerErrorMessage: boolean;
	skipTermsAndConditions: boolean;
}

interface StoreProps {
	account: api.Account;
	config: state.Config;
	subscriptions: state.Account['subscriptionDetails'];
	accountBillingPath?: string;
	location?: HistoryLocation;
	maintenanceMode?: boolean;
}

interface DispatchProps {
	openModal: typeof OpenModal;
	closeModal: typeof CloseModal;
	cancelSubscription: typeof cancelSubscription;
	setRememberCard: typeof setRememberCard;
	getPaymentMethods: typeof getPaymentMethods;
	getSubscriptionDetails: typeof getSubscriptionDetails;
	deleteRememberCard: typeof deleteRememberCard;
	pageAnalyticsEvent: (path: string, originator?: any) => any;
	getAccountSubscriptionPricePlanPrices: (pricePlanIds: string[]) => any;
	selectPricePlan: (plan: api.PricePlan | undefined, group: string) => any;
	getAccountInfo: typeof getAccount;
	setAppTheme: typeof setAppTheme;
	checkMaintenanceStatus: () => any;
	updateEntitlements: (packageId: string) => void;
	analyticsEvent: (type, payload?: any) => any;
	resetSubscriptionEntryPoint: () => void;
}

type Props = AccountPageProps & StoreProps & DispatchProps;

class Subscription extends React.Component<Props, State> {
	state: State = {
		selectedSubscription: undefined,
		selectedPricePlan: undefined,
		itemList: undefined,
		itemTitle: undefined,
		filteredSubscriptionIds: [],
		canceledActiveSubscription: false,
		showPaymentOverlay: false,
		isSuccessfulPayment: false,
		loading: true,
		showLoadingScreen: false,
		isFullDiscountSubscription: false,
		showPartnerErrorMessage: false,
		skipTermsAndConditions: false
	};

	static defaultProps = {
		entries: [],
		subscriptions: []
	};

	componentDidMount() {
		const {
			entries,
			checkMaintenanceStatus,
			analyticsEvent,
			resetSubscriptionEntryPoint,
			location,
			config
		} = this.props;

		// redirect  Cessation plan ids to subscription page
		const CessationProvidersDetails = get(config, 'general.customFields.CessationProviderDetails');
		// Get the cessation PlanIds
		const cessationPlanIds = getPackageIds(CessationProvidersDetails);

		const selectedPricePlanId = get(location, 'query.selectedPricePlanId');
		if (cessationPlanIds && cessationPlanIds.includes(selectedPricePlanId)) {
			browserHistory.push(getPathByKey(PricePlanPageKey, config));
		}

		/**  The analyticsEvent is triggered within the componentDidMount lifecycle method instead of using the PAGE_VIEWED event.
		 *  This approach is chosen because the PAGE_VIEWED event shares the same key with another subsequent path, specifically 
			the subscription detail page.
			If we were to use the key from the PAGE_VIEWED event,
			it would trigger the event not only on the current page but also on the subscription detail page.
		   This could lead to inaccurate analytics as the event would be fired in an unintended location.
		 */
		analyticsEvent(AnalyticsEventType.SUBSCRIBE_PAGE);
		resetSubscriptionEntryPoint();

		if (entries && entries.length >= 1) {
			this.changeUserFlow(this.props);
		}

		checkMaintenanceStatus().finally(() => {
			this.selectPlanByUrl(this.props);
			this.shouldRenderPaymentScreen();
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		if (nextProps.entries !== this.props.entries) {
			this.setState({ showPartnerErrorMessage: false }, () => {
				this.changeUserFlow(nextProps);
				this.selectPlanByUrl(nextProps);
			});
		}

		if (nextProps.location !== this.props.location) {
			const {
				query: { entryId, selectedPricePlanId, priceplan }
			} = nextProps.location;

			if (!entryId && !selectedPricePlanId && !priceplan) {
				this.setState({ selectedSubscription: undefined, selectedPricePlan: undefined });
			} else {
				this.selectPlanByUrl(nextProps);
			}
		}
	}

	componentDidUpdate(prevProps: Props, prevState: State) {
		const { selectedSubscription, showPaymentOverlay } = this.state;

		if (!showPaymentOverlay) {
			// Toasts should be hidden when user selects plan and is on purchase flow
			if (selectedSubscription && !prevState.selectedSubscription) {
				hideToastNotifications();
			}

			// Toasts should be visible when user goes back to main subscription page
			if (!selectedSubscription && prevState.selectedSubscription) {
				showToastNotifications();
			}
		}
	}

	componentWillUnmount() {
		// Clear all toggling of toast notifications
		showToastNotifications();
	}

	private selectPlanByUrl(props: Props) {
		const {
			entries,
			location: {
				query: { entryId, selectedPricePlanId }
			}
		} = props;
		if (!entryId && !selectedPricePlanId) return;
		const entry = entries.find(entry => entry.id === entryId);
		if (!entry) return;
		const { plan, list, title } = entry;
		const selectedPricePlan = plan.pricePlans.find(pricePlan => pricePlan.id === selectedPricePlanId);
		if (!selectedPricePlan) return;
		this.onSubscriptionPlanSelect(entryId, plan, selectedPricePlan, list, title, true);
	}

	isPurchaseNext(): boolean {
		const { packageId } = getPaymentReturnData();
		return !!packageId;
	}

	getSubscriptionInfo(packageId) {
		const { entries } = this.props;
		const filteredSubscriptionEntries = filterSubscriptionEntries(entries, packageId, undefined);
		const selectedPlanEntry = filteredSubscriptionEntries[0];
		const pricePlans = get(selectedPlanEntry, 'plan.pricePlans');
		const selectedPricePlan = (pricePlans || []).find(plan => plan.id === packageId);
		if (!selectedPlanEntry) {
			return {
				selectedPricePlan: undefined,
				itemList: undefined,
				itemTitle: undefined,
				selectedSubscription: undefined
			};
		}

		const { list, title, plan } = selectedPlanEntry;
		return {
			selectedPricePlan,
			itemList: list,
			itemTitle: title,
			selectedSubscription: plan
		};
	}

	async shouldRenderPaymentScreen() {
		const { getSubscriptionDetails, account, pageAnalyticsEvent } = this.props;
		const { payment } = parseQueryParams(window.location.search);

		if (account) await getSubscriptionDetails();

		if (payment) {
			this.showRedirectPaymentScreen();
		} else {
			pageAnalyticsEvent(window.location.pathname);
		}
		this.setState({ loading: false });
	}

	showRedirectPaymentScreen() {
		const {
			paymentType,
			changeCard = false,
			packageId,
			paymentMethodId,
			entitlementValidated
		} = getPaymentReturnData();
		const { pageAnalyticsEvent, analyticsEvent } = this.props;
		const { status } = parseQueryParams(window.location.search);
		const isSuccessfulPayment = status === PaymentSuccessStatusMap[paymentType];

		if (!isSuccessfulPayment) {
			analyticsEvent(AnalyticsEventType.SUBSCRIPTION_FAILURE);
			const paymentReturnData = getPaymentReturnData();
			if (!paymentReturnData.payAnalyticsDone) {
				pageAnalyticsEvent(subscriptionPaymentFailedPath(packageId));
				setItem(LAST_PAYMENT_RETURN_DATA_NAME, { ...paymentReturnData, payAnalyticsDone: true });
			}
		}

		if (changeCard) {
			if (isSuccessfulPayment) {
				this.showRememberCardModal();
			} else {
				this.props.openModal(unsuccessfulCardChange(() => this.changeCardRedirect()));
			}
		} else {
			if (isSuccessfulPayment) {
				if (!entitlementValidated) {
					this.props.updateEntitlements(packageId);
				}
				// if not subsequent purchase, show remember card modal
				if (paymentType === PaymentMethods.CARD && !paymentMethodId) {
					this.showRememberCardModal();
				}
			}
			this.setState({ loading: false, showPaymentOverlay: true, isSuccessfulPayment });
		}
	}

	rememberCardDetails() {
		const { closeModal, setRememberCard } = this.props;
		closeModal(REMEMBER_CARD_MODAL_ID);

		const { changeCard } = getPaymentReturnData();
		if (changeCard) {
			setRememberCard();
			this.onCardChangeSuccessful();
		} else {
			setRememberCard();
		}
	}

	discardSavingCardDetails() {
		const { closeModal, deleteRememberCard } = this.props;
		closeModal(REMEMBER_CARD_MODAL_ID);
		const { changeCard } = getPaymentReturnData();
		deleteRememberCard().then(() => changeCard && this.onCardChangeSuccessful());
	}

	onCardChangeSuccessful = () => {
		this.props.openModal(successfulCardChange(() => this.changeCardRedirect()));
	};

	changeCardRedirect = () => {
		if (this.isPurchaseNext()) {
			this.setState({ showPaymentOverlay: false });
			this.retryPurchase();
		} else {
			this.setState({ showPaymentOverlay: false, showLoadingScreen: true });
			browserHistory.push(this.props.accountBillingPath);
		}
	};

	showRememberCardModal() {
		this.props.openModal(
			showRememberCardModal(() => this.rememberCardDetails(), () => this.discardSavingCardDetails())
		);
	}

	onFailedFullDiscountPayment = () => {
		window.scrollTo({ top: 0 });
		this.setState({
			showPaymentOverlay: true,
			selectedSubscription: undefined,
			selectedPricePlan: undefined,
			isSuccessfulPayment: false,
			isFullDiscountSubscription: true
		});
	};

	onSuccessPayment = () => {
		window.scrollTo({ top: 0 });
		this.setState({
			showPaymentOverlay: true,
			selectedSubscription: undefined,
			selectedPricePlan: undefined,
			isSuccessfulPayment: true
		});
	};

	changeUserFlow = (props: Props) => {
		const { entries, location, account, activeProfile, config } = props;
		const pricePlanIdsString = get(location, 'query.priceplans');
		const pricePlanId = get(location, 'query.priceplan');
		const goToSummary = get(location, 'query.gotosummary');

		let filteredEntry;
		if ((pricePlanIdsString || pricePlanId) && entries.length > 0) {
			const pricePlanIds = pricePlanIdsString && pricePlanIdsString.split(',');
			const filteredSubscriptionEntries = filterSubscriptionEntries(
				entries,
				pricePlanIdsString ? pricePlanIds : [pricePlanId],
				!goToSummary ? this.showError : undefined
			);
			this.setState({ filteredSubscriptionIds: filteredSubscriptionEntries.map(entry => entry.id) });
			filteredEntry = filteredSubscriptionEntries[0];

			// if in resubscribe mode go directly to the payment summary page
			const isResubscribe = get(location, 'query.resubscribe');

			if (isResubscribe && pricePlanId && filteredSubscriptionEntries.length) {
				this.setReSubscriptionPlanId(filteredEntry, pricePlanId);
			}

			if (goToSummary) {
				const isPrimaryProfile = account && activeProfile && account.primaryProfileId === activeProfile.id;

				if (!account) {
					browserHistory.push(`/${getSignInPath(config)}`);
				}
				if (account && !isPrimaryProfile) {
					this.setState({
						selectedSubscription: undefined,
						selectedPricePlan: undefined,
						itemList: undefined,
						itemTitle: undefined,
						filteredSubscriptionIds: [],
						canceledActiveSubscription: false
					});
					browserHistory.push(getPathByKey(PricePlanPageKey, config));
				}
				if (account && isPrimaryProfile && filteredEntry) {
					const { id, plan, list, title } = filteredEntry;
					const selectedPricePlan = plan && plan.pricePlans.find(p => p.id === pricePlanId);
					this.onSubscriptionPlanSelect(id, plan, selectedPricePlan, list, title);
				}
			}
		}
	};

	render() {
		const {
			selectedSubscription,
			selectedPricePlan,
			canceledActiveSubscription,
			loading,
			showLoadingScreen,
			itemList,
			itemTitle,
			showPaymentOverlay,
			skipTermsAndConditions
		} = this.state;
		const { account, activeProfile, location, maintenanceMode } = this.props;

		// Prevents flashing of screen
		if (_SSR_) return <div />;

		if (maintenanceMode) {
			this.props.setAppTheme('default');
			return <Maintenance />;
		}

		const isPrimaryProfile = account && activeProfile && account.primaryProfileId === activeProfile.id;

		if (showLoadingScreen) {
			return <AlertModal hideCloseIcon={true} title={'@{subscriptions_loading_screen}'} />;
		}

		if (loading) {
			return this.renderSpinner();
		}

		if (selectedSubscription && selectedPricePlan && !showPaymentOverlay) {
			if (this.getIdenticalSubscription(selectedSubscription)) {
				return this.renderIdenticalPlanMessage();
			}

			const conflictingPackage = this.getConflictingSubscription(selectedSubscription);
			if (conflictingPackage && !canceledActiveSubscription) {
				return this.renderConflictingPlanMessage(conflictingPackage.name);
			}
			return (
				<div className={cx(bem.b(), bem.e('summary'))}>
					{this.renderHeaderEntry('subscription_summary_title')}
					<SubscriptionPlanSummary
						onUpdateSelectedPricePlan={this.onUpdateSelectedPricePlan}
						plan={selectedSubscription}
						selectedPricePlan={selectedPricePlan}
						list={itemList}
						title={itemTitle}
						account={account}
						isPrimaryProfile={isPrimaryProfile}
						location={location}
						onSuccessPayment={this.onSuccessPayment}
						onFailedPayment={this.failedPaymentConfirmation}
						onFailedFullDiscountPayment={this.onFailedFullDiscountPayment}
						skipTermsAndConditions={skipTermsAndConditions}
					/>
				</div>
			);
		} else {
			return this.renderOverview(isPrimaryProfile);
		}
	}

	renderSpinner() {
		return (
			<div className={cx(bem.b(), 'spinner-container')}>
				<Spinner className={bem.e('spinner')} />
			</div>
		);
	}

	renderHeaderEntry(titleKey?: string) {
		const { entries, renderEntry } = this.props;
		const headerEntry = entries && entries.find(entry => entry.template === H10Template);

		if (!headerEntry) return <div />;

		if (titleKey) {
			return (
				<IntlFormatter
					elementType={({ children: text }) => renderEntry(headerEntry, 0, { text }) as any}
				>{`@{${titleKey}}`}</IntlFormatter>
			);
		} else {
			return renderEntry(headerEntry, 0);
		}
	}

	renderConflictingPlanMessage(packageName: string) {
		return (
			<div className={cx(bem.b(), bemConflict.b())}>
				{this.renderHeaderEntry('subscription_conflict_title')}
				<div className={bemConflict.e('conflict-message')}>
					<IntlFormatter tagName="p" values={{ packageName }} className={bemConflict.e('title')}>
						{'@{subscription_conflict_message1}'}
					</IntlFormatter>
					<IntlFormatter tagName="p">{'@{subscription_conflict_message2}'}</IntlFormatter>
					<IntlFormatter tagName="p">{'@{subscription_conflict_message3}'}</IntlFormatter>
				</div>

				<div className={bemConflict.e('buttons')}>
					<CtaButton ordinal="primary" className="proceed" onClick={this.onConflictConfirm}>
						<IntlFormatter>{'@{subscription_conflict_button_confirm_label}'}</IntlFormatter>
					</CtaButton>

					<CtaButton ordinal="secondary" className="back" onClick={this.onConflictCancel}>
						<IntlFormatter>{'@{button_label_back}'}</IntlFormatter>
					</CtaButton>
				</div>
			</div>
		);
	}

	renderIdenticalPlanMessage() {
		return (
			<div className={cx(bem.b(), bemConflict.b())}>
				{this.renderHeaderEntry('subscription_identical_title')}
				<div className={bemConflict.e('conflict-message')}>
					<IntlFormatter tagName="p">{'@{subscription_identical_message}'}</IntlFormatter>
				</div>
				<div className={bemConflict.e('buttons')}>
					<CtaButton ordinal="secondary" className="back" onClick={this.onIdenticalCancel}>
						<IntlFormatter>{'@{error_dialog_button_ok}'}</IntlFormatter>
					</CtaButton>
				</div>
			</div>
		);
	}

	renderOverview(isPrimaryProfile: boolean) {
		const { entries, account, renderEntry, location, pageAnalyticsEvent } = this.props;
		const {
			filteredSubscriptionIds,
			showPaymentOverlay,
			isSuccessfulPayment,
			isFullDiscountSubscription,
			showPartnerErrorMessage
		} = this.state;
		const paymentReturnData = getPaymentReturnData();
		const { packageId, paymentType, packageName: storedPackageName } = paymentReturnData;
		const currentPlan = this.getSubscriptionInfo(packageId);
		const packageName = get(currentPlan, 'selectedPricePlan.name') || storedPackageName;
		const hasPricePlansFilter = typeof get(location, 'query.priceplans') !== 'undefined';
		let props: PaymentConfirmationOverlayProps;

		if (showPaymentOverlay) {
			props = getPaymentOverlayData(
				packageName,
				paymentType,
				isSuccessfulPayment,
				this.failedPaymentConfirmation,
				this.successfullPaymentConfirm,
				isFullDiscountSubscription
			);
		}

		if (showPaymentOverlay) {
			if (packageName && !paymentReturnData.payAnalyticsDone) {
				pageAnalyticsEvent(subscriptionPaymentSuccessPath(packageId), {
					isSuccessfulPayment,
					packageId,
					packageName
				});
				setItem(LAST_PAYMENT_RETURN_DATA_NAME, { ...paymentReturnData, payAnalyticsDone: true });
			}

			return (
				<div className={bem.b()}>
					{this.renderHeaderEntry()}
					<PaymentConfirmationOverlay {...props} />
				</div>
			);
		}

		return (
			<div className={bem.b()}>
				{entries.map((entry, index) => {
					if (!isPrimaryProfile && account && entry.template === H10Template)
						return this.renderHeaderWithWarningMessage(entry, index);

					if (entry.template === SX1ActiveSubscription) return this.renderActiveSubscriptions(entry);

					if (entry.template === SX2SubscriptionPlan) {
						if (
							(filteredSubscriptionIds.length === 0 && !hasPricePlansFilter) ||
							(filteredSubscriptionIds.length > 0 && filteredSubscriptionIds.includes(entry.id))
						)
							return this.renderSubscriptionPackage(entry, index);
						else return;
					}
					return renderEntry(entry, index);
				})}
				{showPartnerErrorMessage && this.renderNoPackagesMessage()}
			</div>
		);
	}

	renderNoPackagesMessage() {
		const { pageKey } = this.props;
		// Do not render partner error message in Subscription Homepage
		if (pageKey === PricePlanPageKey) return;
		return (
			<IntlFormatter tagName="h4" className={bem.e('no-partner-offer')}>
				{'@{subscriptions_no_partner_offer}'}
			</IntlFormatter>
		);
	}

	failedPaymentConfirmation = () => this.retryPurchase();

	retryPurchase = () => {
		const { packageId, promoCode } = getPaymentReturnData();
		const { selectedPricePlan, itemList, itemTitle, selectedSubscription } = this.getSubscriptionInfo(packageId);

		this.setState({
			showPaymentOverlay: false,
			selectedPricePlan,
			itemList,
			itemTitle,
			selectedSubscription,
			skipTermsAndConditions: true
		});
		browserHistory.replace(getSubscriptionSummaryPage(this.props.config, selectedPricePlan.id, promoCode));
	};

	successfullPaymentConfirm = () => {
		const currentPath = window.location.pathname;
		const { path: newPath } = getPaymentReturnData();
		const routeChanged = newPath !== currentPath;
		this.setState({ showPaymentOverlay: false, showLoadingScreen: routeChanged });
		browserHistory.push(newPath);
	};

	renderSubscriptionPackage(entry: api.PageEntry, index: number) {
		const { location, renderEntry, item, activeProfile, account, config } = this.props;
		const { filteredSubscriptionIds } = this.state;
		const isPrimaryProfile = account && activeProfile && account.primaryProfileId === activeProfile.id;

		const pricePlanId = get(location, 'query.priceplan');

		return (
			<div className={bem.e('price-plans')} key={entry.id}>
				{renderEntry(entry, index + 1, {
					onSubscriptionPlanSelect: this.onSubscriptionPlanSelect,
					item,
					account,
					config,
					location,
					isPrimaryProfile,
					selectedPricePlanId: filteredSubscriptionIds.length === 1 && pricePlanId
				})}
			</div>
		);
	}

	renderActiveSubscriptions(entry: api.PageEntry) {
		const { entries, renderEntry, account, activeProfile } = this.props;
		const isPrimaryProfile = account && activeProfile && account.primaryProfileId === activeProfile.id;
		const subscriptions = account && entries && this.getAdditionalSubscriptionInfo();
		const activeSubscriptions = subscriptions && subscriptions.filter(plan => plan.status === 'Active');

		if (!account || (activeSubscriptions && !activeSubscriptions.length)) return;
		return renderEntry(entry, 1, {
			isPrimaryProfile,
			subscriptions: activeSubscriptions
		});
	}

	renderHeaderWithWarningMessage(entry, index) {
		return (
			<div key={index}>
				{this.props.renderEntry(entry, index)}
				<div className={bem.e('warning')}>
					<WarningIcon className={bem.e('warning-icon')} />
					<IntlFormatter>{'@{subscription_choose_plan_modal_warning}'}</IntlFormatter>
				</div>
			</div>
		);
	}

	getAdditionalSubscriptionInfo() {
		const { entries, subscriptions } = this.props;
		const planEntries = entries.filter(entry => entry.plan);
		const pricePlans = planEntries.map(item => item.plan.pricePlans);

		subscriptions.forEach((item: any) => {
			pricePlans.forEach((plansArray, i) => {
				plansArray.forEach(plan => {
					if (plan.id === item.planId) {
						item.list = planEntries[i].list;
						item.price = getPriceInfo(plan.label).pricePerMonth;
					}
				});
			});
		});

		return subscriptions;
	}

	showError = () => {
		const { pageKey, openModal } = this.props;
		// Show default error modal if error occurs on Subscriptions Home
		if (pageKey === PricePlanPageKey) {
			const modalProps = openErrorModal();
			openModal(modalProps);
		} else {
			// Show error message in body on Partner Subscriptions Page
			this.setState({ showPartnerErrorMessage: true });
		}
	};

	onConfirmCancelSubscription = () => {
		const { openModal, closeModal, cancelSubscription } = this.props;
		closeModal(CANCEL_SUBSCRIPTION_MODAL_ID);

		const { selectedSubscription, selectedPricePlan } = this.state;
		const activeSubscription = this.getConflictingSubscription(selectedSubscription);

		if (activeSubscription) {
			cancelSubscription(activeSubscription.planId).then(res => {
				if (res.error) {
					openModal(unsuccessfulCancelSubscriptionModal());
				} else {
					openModal(successfulCancelSubscriptionFromConflictModal(activeSubscription.name, selectedPricePlan.name));
					this.setState({ canceledActiveSubscription: true });
				}
			});
		}
	};

	onConflictConfirm = () => {
		const activeSubscription = this.getConflictingSubscription(this.state.selectedSubscription);
		if (activeSubscription)
			this.props.openModal(conflictingCancelSubscriptionModal(this.onConfirmCancelSubscription, activeSubscription));
	};

	dismissFilteredState = () => {
		const { location, config } = this.props;
		const goToSummary = get(location, 'query.gotosummary');

		if (goToSummary) {
			browserHistory.push(getPathByKey(PricePlanPageKey, config));
			this.setState({ filteredSubscriptionIds: [] });
		} else {
			browserHistory.goBack();
		}
	};

	onConflictCancel = () => {
		this.dismissFilteredState();
		this.setState({ selectedSubscription: undefined, selectedPricePlan: undefined });
	};

	onIdenticalCancel = () => {
		this.dismissFilteredState();
		const { location, accountBillingPath } = this.props;
		const resubscribe = get(location, 'query.resubscribe');
		this.setState({ selectedSubscription: undefined, selectedPricePlan: undefined }, () => {
			if (resubscribe) {
				browserHistory.push(`${accountBillingPath}?expired`);
			}
		});
	};

	onUpdateSelectedPricePlan = (selectedPricePlan: api.PricePlan | undefined) => {
		if (!selectedPricePlan) this.dismissFilteredState();
		this.setState({ selectedPricePlan });
	};

	onSubscriptionPlanSelect = (
		entryId: string,
		selectedSubscription: api.SubscriptionPlan,
		selectedPricePlan: api.PricePlan,
		itemList: api.ItemList,
		itemTitle: string,
		noChangeRoute?: boolean
	) => {
		this.props.getAccountSubscriptionPricePlanPrices([selectedPricePlan.id]).then(response => {
			const redirectToPage = () => {
				this.props.selectPricePlan({ ...this.state.selectedPricePlan }, this.state.itemTitle);
				if (noChangeRoute) return;
				window.scrollTo({ top: 0 });
				const { location } = this.props;
				browserHistory.push(
					addQueryParameterToURL(location.pathname, { entryId, selectedPricePlanId: selectedPricePlan.id })
				);
			};

			if (!response.error) {
				const price = get(response, 'payload.0.price');
				this.setState(
					{
						selectedSubscription,
						selectedPricePlan: { ...selectedPricePlan, price },
						itemList,
						itemTitle
					},
					redirectToPage
				);
			} else {
				this.setState({ selectedSubscription, selectedPricePlan, itemList, itemTitle }, redirectToPage);
			}
		});
	};

	getConflictingSubscription = (selectedSubscription: api.SubscriptionPlan): api.SubscriptionDetail => {
		const { account, subscriptions } = this.props;

		if (!selectedSubscription || !selectedSubscription.conflictingPlans || !account) return undefined;

		for (let subscription of subscriptions) {
			const { status, isCancellationEnabled, planId } = subscription;
			if (status === 'Active' && isCancellationEnabled && selectedSubscription.conflictingPlans.includes(planId))
				return subscription;
		}
		return undefined;
	};

	getIdenticalSubscription = (selectedSubscription: api.SubscriptionPlan): api.SubscriptionDetail => {
		const { account, subscriptions } = this.props;
		const { selectedPricePlan } = this.state;

		if (!selectedSubscription || !account) return;

		for (let subscription of subscriptions) {
			const { status, planId } = subscription;

			if (status === 'Active' && get(selectedPricePlan, 'id') === planId) {
				return subscription;
			}
		}

		return;
	};

	setReSubscriptionPlanId(entry: api.PageEntry, pricePlanId: string) {
		if (!entry || !pricePlanId) return;

		const entryId = get(entry, 'id');
		const selectedPriceSubscription = get(entry, 'plan');
		const selectedPricePlans = get(selectedPriceSubscription, 'pricePlans');
		const selectedPricePlan = selectedPricePlans.find(PricePlan => PricePlan.id === pricePlanId);

		if (!selectedPricePlan) return;

		this.onSubscriptionPlanSelect(entryId, selectedPriceSubscription, selectedPricePlan, entry.list, entry.title);
	}
}

function mapStateToProps({ app, account, page }: state.Root): StoreProps {
	const { config } = app;

	return {
		config,
		account: account && account.info,
		subscriptions: account && account.subscriptionDetails,
		accountBillingPath: getPathByKey(AccountBilling, config),
		location: page.history.location,
		maintenanceMode: (account && account.maintenanceMode) || false
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		cancelSubscription: (id: string) => dispatch(cancelSubscription(id)),
		setRememberCard: () => dispatch(setRememberCard()),
		getPaymentMethods: () => dispatch(getPaymentMethods()),
		deleteRememberCard: () => dispatch(deleteRememberCard()),
		getSubscriptionDetails: () => dispatch(getSubscriptionDetails()),
		pageAnalyticsEvent: (path: string, originator?: any) => dispatch(pageAnalyticsEvent(path, originator)),
		getAccountSubscriptionPricePlanPrices: (pricePlanIds: string[]) =>
			dispatch(getAccountSubscriptionPricePlanPrices(pricePlanIds)),
		selectPricePlan: (plan: api.PricePlan, group: string) => dispatch(selectPricePlan(plan, group)),
		getAccountInfo: () => dispatch(getAccount()),
		setAppTheme: theme => dispatch(setAppTheme(theme)),
		checkMaintenanceStatus: () => dispatch(checkMaintenanceStatus()),
		updateEntitlements: (packageId: string) => dispatch(updateEntitlements(packageId)),
		analyticsEvent: (type, payload) => dispatch(analyticsEvent(type, { payload })),
		resetSubscriptionEntryPoint: () => dispatch({ type: REMOVE_SUBSCRIPTION_ENTRY_POINT })
	};
}

export default configAccountPage(Subscription, {
	template,
	entryRenderers,
	mapStateToProps,
	mapDispatchToProps,
	preventScrollRestoration: true
});
