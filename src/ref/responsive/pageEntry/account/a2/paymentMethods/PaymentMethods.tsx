import * as React from 'react';
import { connect } from 'react-redux';
import { getPaymentMethods } from 'shared/service/action/account';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PaymentMethodRow from './PaymentMethodRow';
import CtaButton from 'ref/responsive/component/CtaButton';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import { noop } from 'shared/util/function';
import { memoize } from 'shared/util/performance';

import './PaymentMethods.scss';

interface PaymentMethodsProps {
	getPaymentMethods?: () => void;
	defaultPaymentMethodId?: string;
	paymentMethods?: api.PaymentMethod[];
}

const bem = new Bem('payment-methods');

export class PaymentMethods extends React.Component<PaymentMethodsProps, any> {
	static defaultProps = {
		getPaymentMethods: noop,
		paymentMethods: []
	};

	componentDidMount() {
		this.props.getPaymentMethods();
	}

	render() {
		return (
			<AccountEntryWrapper title={'@{account.billing.paymentMethods|Payment Methods}'}>
				{this.renderPaymentMethods()}
				<CtaButton className={bem.e('btn')} ordinal="secondary">
					<IntlFormatter>{`@{account.billing.addCreditCardButton|Add New Credit Card}`}</IntlFormatter>
				</CtaButton>
			</AccountEntryWrapper>
		);
	}

	private renderPaymentMethods() {
		const { defaultPaymentMethodId, paymentMethods } = this.props;
		if (!paymentMethods || !paymentMethods.length) {
			return (
				<IntlFormatter elementType="p" className={bem.e('no-method')}>
					{`@{account.billing.noPaymentMethodMessage|You haven't added a payment method yet.}`}
				</IntlFormatter>
			);
		}
		return (
			<div className={bem.b()}>
				{paymentMethods.map(method => (
					<PaymentMethodRow key={method.id} defaultPaymentMethodId={defaultPaymentMethodId} method={method} />
				))}
			</div>
		);
	}
}

const filterCards = memoize((paymentMethods: api.PaymentMethod[]) => {
	return paymentMethods.filter(method => method.type === 'Card');
});

function mapStateToProps({ account }: state.Root) {
	const { paymentMethods } = account;
	return {
		paymentMethods: filterCards(paymentMethods)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		getPaymentMethods: () => {
			dispatch(getPaymentMethods());
		}
	};
}

export default connect<any, any, PaymentMethodsProps>(
	mapStateToProps,
	mapDispatchToProps
)(PaymentMethods);
