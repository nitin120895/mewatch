import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { parseQueryParams } from 'ref/responsive/util/browser';
import Scrollable from 'ref/responsive/component/Scrollable';
import { SX2SubscriptionPlan as template } from 'shared/page/pageEntryTemplate';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { resolveImage } from 'shared/util/images';
import ModalTypes from 'shared/uiLayer/modalTypes';
import ChoosePlanModal from './ChoosePlanModal';
import {
	getChannelInfoModalConfig,
	getSubscriptionSummaryPage,
	openPricePlansModal,
	redirectToSignPage,
	isCessationPlan
} from './subscriptionsUtils';
import ChannelInfoModal from './ChannelInfoModal';
import BonusLink from './BonusLink';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { subscriptionPlanPath } from 'shared/analytics/util/analyticsPath';
import { get } from 'shared/util/objects';
import { getCessationScheduleMessage } from 'toggle/responsive/util/subscriptionUtil';
import './SubscriptionPlan.scss';

const bemPlan = new Bem('subscription-plan');

interface OwnProps extends PageEntryListProps {
	plan: api.SubscriptionPlan;
	isPrimaryProfile: boolean;
	account: api.Account;
	config: state.Config;
	location?: HistoryLocation;
	onSubscriptionPlanSelect: (
		entryId: string,
		selectedSubscription: api.SubscriptionPlan,
		priceplan: api.PricePlan,
		itemList: api.ItemList,
		itemTitle: string
	) => void;
	selectedPricePlanId?: string;
}

interface DispatchProps {
	showModal: (modal: ModalConfig) => any;
	analyticsEvent: (type, payload) => any;
}

type Props = OwnProps & DispatchProps;

class SubscriptionPlan extends React.Component<Props> {
	render() {
		return (
			<div className={bemPlan.b()}>
				{this.renderPricePlanDetails()}
				{this.renderSubscriptionDetails()}
			</div>
		);
	}

	renderplanDetailCtaLabel(multiplePlans) {
		if (multiplePlans) return '@{subscriptions_subscribe_section_view_plans|View Plans}';
		return '@{subscriptions_subscribe_section_subscribe|Subscribe}';
	}

	// Function to find the key based on cpName value
	private findKeyByCpName = (obj, targetCpName) => {
		for (const key in obj) {
			if (obj[key].cpName.toUpperCase() === targetCpName.toUpperCase()) {
				return key;
			}
		}
		/* tslint:disable-next-line:no-null-keyword */
		return null;
	};

	renderPackageHeaders() {
		const { plan, title, config } = this.props;
		const CessationProvidersDetails = get(config, 'general.customFields.CessationProviderDetails');
		const { packageHeaderText1, packageHeaderText2, packageHeaderText3 } = plan;
		const providerGroupName = this.findKeyByCpName(CessationProvidersDetails, title);
		const cpName =
			(providerGroupName && get(config, `general.customFields.CessationProviderDetails.${providerGroupName}.cpName`)) ||
			'';

		// Using the plan title and cpName to determine whether it is cessation plan, as the subscription API entry does not have a distinct value to identify if the plan is cessation or not. The plan ID can't be used as it varies in every environment.
		if (isCessationPlan(title, cpName)) {
			let cessationSubscriptionDisclaimer = getCessationScheduleMessage(config, providerGroupName);
			return (
				<IntlFormatter className={bemPlan.e('subscribe-section', 'cessation-disclaimer')}>
					{cessationSubscriptionDisclaimer}
				</IntlFormatter>
			);
		}
		return [
			<div key="label" className={bemPlan.e('subscribe-section', 'label')}>
				{packageHeaderText1}
			</div>,
			<div key="price" className={bemPlan.e('subscribe-section', 'price')}>
				{packageHeaderText2}
			</div>,
			<IntlFormatter key="contract" className={bemPlan.e('subscribe-section', 'contract')}>
				{packageHeaderText3 ? packageHeaderText3 : '@{subscriptions_subscribe_section_no_contract}'}
			</IntlFormatter>
		];
	}

	renderPricePlanDetails() {
		const { plan, list, isPrimaryProfile, account, selectedPricePlanId, title, config } = this.props;
		const multiplePlans = plan.pricePlans && plan.pricePlans.length > 1 && !selectedPricePlanId;
		const singlePricePlan = selectedPricePlanId
			? plan.pricePlans.find(plan => plan.id === selectedPricePlanId)
			: plan.pricePlans[0];

		const image = resolveImage(list.images, 'wallpaper', { width: 510 });
		const isSecondaryProfile = account && !isPrimaryProfile;
		const renderButton = (multiplePlans && isSecondaryProfile) || isPrimaryProfile || !account;

		const CessationProvidersDetails = get(config, 'general.customFields.CessationProviderDetails');
		const providerGroupName = this.findKeyByCpName(CessationProvidersDetails, title);
		const cpName =
			(providerGroupName && get(config, `general.customFields.CessationProviderDetails.${providerGroupName}.cpName`)) ||
			'';

		return (
			<div className={bemPlan.e('subscribe-section', 'details')}>
				<div className={bemPlan.e('subscribe-section', 'image')}>
					<img src={image.src} alt="" />
				</div>
				<div className={bemPlan.e('subscribe-section', 'price-info')}>
					{this.renderPackageHeaders()}
					{renderButton && !isCessationPlan(title, cpName) && (
						<div className={bemPlan.e('subscribe-section', 'button-container')}>
							<CtaButton
								ordinal="primary"
								className={bemPlan.e('subscribe-section', 'cta')}
								onClick={multiplePlans ? this.showPricePlansModal : () => this.choosePlan(singlePricePlan)}
							>
								<IntlFormatter>{this.renderplanDetailCtaLabel(multiplePlans)}</IntlFormatter>
							</CtaButton>
						</div>
					)}
				</div>
			</div>
		);
	}

	renderSubscriptionDetails() {
		const { title, plan, list } = this.props;
		const { bonusText1, bonusText1Link, bonusText2, bonusText2Link } = plan;

		return (
			<div className={bemPlan.e('info-section')}>
				<div className={bemPlan.e('title')}>{title}</div>
				{bonusText1 && <BonusLink url={bonusText1Link} label={bonusText1} />}
				{bonusText2 && <BonusLink url={bonusText2Link} label={bonusText2} />}
				<div className={bemPlan.e('description')}>{plan.description}</div>
				<Scrollable className={bemPlan.e('channels-carousel')} length={list.items && list.items.length}>
					{list.items.map(this.renderChannel)}
				</Scrollable>
			</div>
		);
	}

	renderChannel = (item: api.ItemSummary, index) => {
		const imageExists = item.images && (item.images.custom || item.images.tile);
		return (
			<div
				key={item.id}
				className={bemPlan.e('channel-image-container')}
				onClick={() => this.onCarouselItemClick(item)}
			>
				{imageExists ? (
					<img key={index} src={item.images.tile || item.images.custom} alt="" />
				) : (
					<div className="no-image" />
				)}
				<div className="channel-title">{item.title}</div>
			</div>
		);
	};

	onCarouselItemClick = (item: api.ItemSummary) => {
		const { showModal, list } = this.props;
		const props = getChannelInfoModalConfig(item, list.images);
		showModal({
			id: props.id,
			type: ModalTypes.CUSTOM,
			element: <ChannelInfoModal {...props} />
		});
	};

	showPricePlansModal = () => {
		const { plan, title, isPrimaryProfile, account, showModal, analyticsEvent } = this.props;
		const props = openPricePlansModal(this.choosePlan, plan, title, isPrimaryProfile, account);
		showModal({
			id: props.id,
			type: ModalTypes.CUSTOM,
			element: <ChoosePlanModal {...props} />
		});
		const firstPlan = plan.pricePlans.slice(0, 1).shift();
		const analyticsPath = subscriptionPlanPath(firstPlan);

		if (firstPlan && analyticsPath) {
			analyticsEvent(AnalyticsEventType.SUBSCRIPTION_VIEW_PLAN, { plan: { ...plan, group: title } });
		}
	};

	choosePlan = (pricePlan?: api.PricePlan) => {
		const { account, location, config, onSubscriptionPlanSelect, id, plan, list, title, analyticsEvent } = this.props;
		const { pricePlans } = plan;

		const multiplePlans = pricePlans && pricePlans.length > 1;
		const pricePlanId = pricePlan ? pricePlan.id : pricePlans[0].id;

		analyticsEvent(AnalyticsEventType.SUBSCRIBE_SELECT_PLANS, { plan: { ...pricePlan, group: title } });

		if (!account) {
			let redirectPath = getSubscriptionSummaryPage(config, pricePlanId);

			const { promocode } = parseQueryParams(location.search);
			if (promocode) redirectPath += `&promocode=${promocode}`;

			redirectToSignPage(config, encodeURIComponent(redirectPath));
			return;
		}

		onSubscriptionPlanSelect(id, plan, multiplePlans ? pricePlan : pricePlans[0], list, title);
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		analyticsEvent: (type, payload) => dispatch(analyticsEvent(type, { payload }))
	};
}

const Component: any = connect<undefined, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(SubscriptionPlan);
Component.template = template;

export default Component;
