import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import TextInput from 'ref/responsive/component/input/TextInput';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { applyPromocode } from 'shared/service/action/account';
import * as account from 'shared/service/account';
import { subscriptionWithPromoDetail } from 'shared/account/accountWorkflow';
import { get } from 'shared/util/objects';
import { FormattedNumber } from 'react-intl';
import { parseQueryParams } from 'ref/responsive/util/browser';
import * as cx from 'classnames';
import { getGSTAmount } from '../../pageEntry/subscription/subscriptionsUtils';

import './SubscriptionPriceSummary.scss';

const bem = new Bem('subscription-price-summary');

interface OwnProps {
	plan: api.SubscriptionPlan;
	selectedPricePlan: api.PricePlan;
	openPricePlansModal: () => void;
	hidePromoCode: boolean;
	onPromoCodeChange: (promoCode: string) => void;
	promoCode?: string;
	setDiscountPrice: (price: number) => void;
}

interface StoreProps {
	defaultCurrency;
}

interface DispatchProps {
	applyPromocode: typeof applyPromocode;
	subscriptionWithPromoDetail: (promoCode: string, discountedPrice?: number) => any;
}

type Props = OwnProps & StoreProps & DispatchProps;

interface State {
	codeApplied: boolean;
	codeValid: boolean;
	discountedPrice: number;
	autoApply: boolean;
}

class SubscriptionPlanPriceSummary extends React.Component<Props, State> {
	state: State = {
		codeApplied: false,
		codeValid: true,
		discountedPrice: undefined,
		autoApply: true
	};

	componentWillReceiveProps(nextProps: Props) {
		const { promoCode, selectedPricePlan } = nextProps;
		if (promoCode && promoCode.length > 1 && promoCode !== this.props.promoCode && this.state.autoApply) {
			this.applyPromocode(selectedPricePlan, promoCode);
			this.setState({ autoApply: false });
		}
	}

	private onPromoChange = e => {
		const { value } = e.target;
		this.setState((prevState: State) => ({
			autoApply: false,
			codeApplied: value ? prevState.codeApplied : false,
			codeValid: value ? prevState.codeValid : true
		}));
		this.props.onPromoCodeChange(value);
	};

	private sendPromoCodeAnalytics = () => {
		const { promoCode, subscriptionWithPromoDetail } = this.props;
		const { discountedPrice } = this.state;
		subscriptionWithPromoDetail(promoCode, discountedPrice);
	};

	private onApplyPromoClick = () => {
		const { codeApplied, codeValid } = this.state;
		const { promoCode, selectedPricePlan, onPromoCodeChange, subscriptionWithPromoDetail } = this.props;

		if (!promoCode) return;

		if (!codeApplied && !codeValid) {
			this.setState({ codeValid: true });
		}

		if (codeApplied && codeValid) {
			this.setState({ codeApplied: false, codeValid: true, discountedPrice: undefined });
			subscriptionWithPromoDetail('');
			onPromoCodeChange('');
			return;
		}

		this.applyPromocode(selectedPricePlan, promoCode, this.sendPromoCodeAnalytics);
	};

	applyPromocode(selectedPricePlan: api.PricePlan, promoCode: string, callback?: () => any) {
		const { setDiscountPrice } = this.props;
		this.props
			.applyPromocode(selectedPricePlan.id, { promocode: promoCode })
			.then(response => {
				if (response.error) {
					this.onPromoFailed();
				} else {
					this.setState(
						{
							codeApplied: true,
							codeValid: true,
							discountedPrice: get(response, 'payload.price') || 0
						},
						() => {
							setDiscountPrice(this.state.discountedPrice);
							callback && callback();
						}
					);
				}
			})
			.catch(error => {
				this.onPromoFailed();
			});
	}

	onPromoFailed = () => {
		this.setState({ codeApplied: false, codeValid: false });
	};

	onPromoPaste = () => {
		const { promocode } = parseQueryParams(location.search);
		this.setState({ codeApplied: false, codeValid: true, autoApply: !!promocode });
	};

	getPromoDisplayState(): { displayState: form.DisplayState; message: string } {
		const { codeApplied, codeValid } = this.state;

		if (!this.props.promoCode) return { displayState: 'default', message: '' };
		if (codeApplied) {
			return {
				displayState: 'success',
				message: '@{subscription_summary_promo_code_applied|Promotion code applied}'
			};
		} else if (!codeValid) {
			return {
				displayState: 'error',
				message: '@{subscription_summary_promo_code_not_valid|Promotion code not valid}'
			};
		}
		return { displayState: 'default', message: '' };
	}

	render() {
		return (
			<div className={cx(bem.b(), { 'hide-promo-code': this.props.hidePromoCode })}>
				{this.renderPromotionSummary()}
				{this.renderPriceSummary()}
			</div>
		);
	}

	renderPromotionSummary() {
		const { codeApplied } = this.state;
		const { displayState, message } = this.getPromoDisplayState();

		return (
			<div className={bem.e('promotion-summary')}>
				<TextInput
					id="promotionCode"
					name="promotionCode"
					type="text"
					required={true}
					disabled={codeApplied}
					label="@{subscription_summary_promo_code}"
					displayState={displayState}
					value={this.props.promoCode}
					onPaste={this.onPromoPaste}
					onInput={this.onPromoChange}
					message={message}
				/>

				<CtaButton ordinal="secondary" onClick={this.onApplyPromoClick}>
					<IntlFormatter>
						{codeApplied ? '@{subscription_summary_promo_code_remove}' : '@{subscription_summary_promo_code_apply}'}
					</IntlFormatter>
				</CtaButton>
			</div>
		);
	}

	renderPriceSummary() {
		const { selectedPricePlan, plan, openPricePlansModal, defaultCurrency } = this.props;
		const { codeApplied, codeValid, discountedPrice } = this.state;
		const currency = selectedPricePlan.currency || defaultCurrency;
		const totalPrice = codeApplied ? discountedPrice : selectedPricePlan.price;

		return (
			<div className={bem.e('price-summary')}>
				<div className="price-savings">
					<div className="labels">
						{(codeApplied || !codeValid) && <IntlFormatter>{'@{subscription_summary_price}'}</IntlFormatter>}
						{codeApplied && <IntlFormatter>{'@{subscription_summary_savings}'}</IntlFormatter>}
						{codeApplied && <span className="empty" />}
						<IntlFormatter className="total-price">{'@{subscription_summary_total_price}'}</IntlFormatter>
					</div>

					<div className="values">
						{(codeApplied || !codeValid) && (
							<span>
								<FormattedNumber value={selectedPricePlan.price || 0} currency={currency} style="currency" />
							</span>
						)}
						{codeApplied && (
							<span>
								<FormattedNumber
									value={discountedPrice - selectedPricePlan.price || 0}
									currency={currency}
									style="currency"
								/>
							</span>
						)}
						{this.renderDiscountedPrice()}
						<span className="total-price">
							<FormattedNumber value={totalPrice || 0} currency={currency} style="currency" />
						</span>
					</div>
				</div>
				{this.renderGSTAmount(totalPrice)}
				{plan.pricePlans.length > 1 && (
					<IntlFormatter tagName="div" className="link" onClick={openPricePlansModal}>
						{'@{subscription_summary_change_price_plan}'}
					</IntlFormatter>
				)}
			</div>
		);
	}

	renderGSTAmount(totalPrice: number) {
		const { selectedPricePlan, defaultCurrency } = this.props;
		const gstAmount = totalPrice ? getGSTAmount(totalPrice) : 0;
		const currency = selectedPricePlan.currency || defaultCurrency;
		return (
			<div className="gst-amount">
				<IntlFormatter className="label">{'@{subscription_summary_gst_amount}'}</IntlFormatter>
				(<FormattedNumber value={gstAmount} currency={currency} style="currency" />)
			</div>
		);
	}

	renderDiscountedPrice() {
		const { selectedPricePlan, promoCode } = this.props;
		const { codeApplied, discountedPrice } = this.state;

		const savings = Math.round((Math.abs(discountedPrice - selectedPricePlan.price) / selectedPricePlan.price) * 100);

		if (codeApplied) {
			return (
				<IntlFormatter
					className="promo"
					values={{
						discountedPrice: savings,
						promoCode
					}}
				>
					{'@{subscription_summary_discount_promo|{discountedPrice}% off ({promoCode})}'}
				</IntlFormatter>
			);
		}
	}
}

function mapStateToProps(state: state.Root) {
	return {
		defaultCurrency: state.app.config.general.currencyCode
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		applyPromocode: (
			id: string,
			body: api.VerifyPromoCodeRequest,
			options?: account.ApplyPromocodeOptions,
			info?: any
		) => dispatch(applyPromocode(id, body, options, info)),
		subscriptionWithPromoDetail: (promoCode: string, discountedPrice?: number) =>
			dispatch(subscriptionWithPromoDetail(promoCode, discountedPrice))
	};
}

export default connect<StoreProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(SubscriptionPlanPriceSummary);
