import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import RadioButtonComponent from '../../component/input/RadioButtonComponent';
import {
	PaymentMethods,
	CardOptions,
	getTelecomPaymentMethods,
	getBillingCardInformation,
	CardBrand
} from '../../util/paymentUtil';
import PaymentCardDetails from '../../pageEntry/account/a2/components/PaymentCardDetails';
import Tick from '../../component/icons/Tick';
import { renderIcon } from '../../util/subscriptionUtil';

import './SubscriptionPaymentMethods.scss';

const bem = new Bem('subscription-payment-methods');

interface Props {
	paymentMethods: api.PaymentMethod[];
	onChangeCardMethod: (selectedCard: string) => void;
	allowedPaymentMethods: string[];
	paymentMethod: PaymentMethods;
	onChangePaymentMethod: (paymentMethod: PaymentMethods) => void;
	selectedCardId: string;
	rememberCard: boolean;
}

interface State {
	selectedCardId: string;
}

export default class SubscriptionPaymentMethods extends React.Component<Props, State> {
	state: State = {
		selectedCardId: undefined
	};

	private cards: api.PaymentMethod[] = [];
	private existingCardAvailable = false;

	constructor(props) {
		super(props);
		const { paymentMethods, rememberCard } = this.props;
		this.cards = getBillingCardInformation(paymentMethods);
		this.existingCardAvailable = this.cards.length > 0 && rememberCard;
	}

	componentDidMount() {
		const { paymentMethod, selectedCardId } = this.props;
		if (paymentMethod === PaymentMethods.CARD) {
			if (selectedCardId) {
				this.setState({ selectedCardId });
			} else {
				if (this.existingCardAvailable) {
					this.onChange(this.cards[this.cards.length - 1].id);
				} else {
					this.onChange(CardOptions.NEW);
				}
			}
		}
	}

	render() {
		const { allowedPaymentMethods, paymentMethod } = this.props;
		const { selectedCardId } = this.state;

		const telecomPaymentOptions = getTelecomPaymentMethods(allowedPaymentMethods);
		const isTelcoOptionAvailable = telecomPaymentOptions.length > 0;
		const isTelco = isTelcoOptionAvailable && paymentMethod === PaymentMethods.TELCO;
		const savedCard = this.existingCardAvailable && this.cards[this.cards.length - 1];

		return (
			<div className={bem.b()}>
				<IntlFormatter tagName="div" className={bem.e('title')}>
					{'@{payment_method_title}'}
				</IntlFormatter>
				<div className={bem.e('options')}>
					{savedCard && this.renderCardOption(savedCard, selectedCardId === savedCard.id)}
					{this.renderCardOption(undefined, selectedCardId === CardOptions.NEW)}
					{isTelcoOptionAvailable && (
						<div
							className={cx(bem.e('payment-row'), bem.e('payment-type', { selected: isTelco }))}
							onClick={() => isTelcoOptionAvailable && this.onClick(PaymentMethods.TELCO, undefined)}
						>
							<IntlFormatter elementType="label">{'@{subscription_payment_method_telco}'}</IntlFormatter>
							<input type="radio" id="paymentMethod" name="paymentMethod" value="TELCO" checked={isTelco} />
							{isTelco && <Tick className={bem.e('icon')} />}
						</div>
					)}
				</div>
			</div>
		);
	}

	onClick = (paymentMethod: PaymentMethods, selectedCardId: string) => {
		const { onChangeCardMethod, onChangePaymentMethod } = this.props;
		this.setState({ selectedCardId });
		onChangeCardMethod(paymentMethod === PaymentMethods.CARD ? selectedCardId : undefined);
		onChangePaymentMethod(paymentMethod);
	};

	renderCardOption(card: api.PaymentMethod, selected: boolean) {
		return (
			<div
				className={cx(bem.e('payment-row'), bem.e('payment-type', { selected }))}
				onClick={() => this.onClick(PaymentMethods.CARD, card ? card.id : CardOptions.NEW)}
			>
				{card ? (
					this.renderCardInformation(card)
				) : (
					<div className={bem.e('payment-type-card')}>
						<div>
							<IntlFormatter elementType="label">{'@{subscription_payment_method_credit}'}</IntlFormatter>
							{this.existingCardAvailable && <div>This card will replace your existing card above.</div>}
						</div>
						{Object.values(CardBrand).map(brand => (
							<span key={brand}>{renderIcon(brand)}</span>
						))}
					</div>
				)}
				<input type="radio" id="paymentMethod" name="paymentMethod" value="CARD" checked={selected} />
				{selected && <Tick className={bem.e('icon')} />}
			</div>
		);
	}

	renderCardPaymentMethod() {
		const { selectedCardId } = this.state;

		if (!this.existingCardAvailable) return;

		return (
			<div className={bem.e('card-container')}>
				{this.cards.map((card, index) => (
					<RadioButtonComponent
						name="card"
						value={card.id}
						key={card.id}
						checked={selectedCardId === card.id || (!selectedCardId && index === 0)}
						onChange={() => this.onChange(card.id)}
					>
						{this.renderCardInformation(card)}
					</RadioButtonComponent>
				))}
				<RadioButtonComponent
					value={CardOptions.NEW}
					key={CardOptions.NEW}
					name="card"
					className="margin-top"
					checked={selectedCardId === CardOptions.NEW}
					label={'@{payment_change_card_label}'}
					onChange={() => this.onChange(CardOptions.NEW)}
				/>
			</div>
		);
	}

	onChange(selectedCardId: string) {
		this.setState({ selectedCardId });
		this.props.onChangeCardMethod(selectedCardId);
	}

	renderCardInformation(card: api.PaymentMethod) {
		return (
			<div>
				<PaymentCardDetails card={card} />
			</div>
		);
	}

	renderTelcoPaymentMethod() {
		const { allowedPaymentMethods, paymentMethod } = this.props;
		const isOptionAvailable = paymentMethod === PaymentMethods.TELCO;
		const telecomPaymentOptions = getTelecomPaymentMethods(allowedPaymentMethods);

		if (!isOptionAvailable) return;

		return (
			<div className={bem.e('telco-container')}>
				{telecomPaymentOptions.map(option => (
					<RadioButtonComponent
						name="payment"
						label={option}
						value={option}
						key={option}
						checked={paymentMethod === PaymentMethods.TELCO}
					/>
				))}
			</div>
		);
	}
}
