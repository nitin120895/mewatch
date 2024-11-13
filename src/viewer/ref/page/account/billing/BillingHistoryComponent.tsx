import * as React from 'react';
import AccountPageStructure from '../../entries/account/AccountPageStructure';
import { BillingHistory } from 'ref/responsive/pageEntry/account/a2/billingHistory/BillingHistory';
import { threePaymentMethods } from './PaymentMethodsListComponent';

const MOCK_API_ROUNDTRIP_DURATION = 1500;
const paymentMethods = threePaymentMethods.paymentMethods;

function mockPurchase({ id, title, date, price, currency = 'AUD', paymentMethodId }: any) {
	const creationDate = new Date(date);
	const authorizationDate = creationDate;
	return {
		id,
		creationDate,
		authorizationDate,
		currency,
		total: price,
		paymentMethodId,
		item: { title, id: `${id}-item-id`, ownership: 'Subscription', resolution: 'SD', type: 'movie' },
		plan: { id: 'th3-pl4n', price: 0, subscriptionId: 'subscription-id', title: 'Basic', type: 'Free' }
	};
}

const mockListOfPurchases = [
	mockPurchase({
		id: 'pf',
		title: 'Pulp Fiction',
		date: '2017/10/04',
		price: 14.9,
		paymentMethodId: paymentMethods[0].id
	}),
	mockPurchase({
		id: 'lorem',
		title:
			'Night of the Day of the Dawn of the Son of the Bride of the Return of the Revenge of the Terror of the Attack of the Evil, Mutant, Hellbound, Flesh-Eating Subhumanoid Zombified Living Dead, Part 2: In Shocking 2-D',
		date: '2017/09/08',
		price: 120,
		currency: 'EUR',
		paymentMethodId: paymentMethods[1].id
	}),
	mockPurchase({
		id: 'ghdg',
		title: 'Ghost Dog: The Way of the Samurai',
		date: '2017/07/15',
		price: 19.99,
		currency: 'USD'
	}),
	/**
	 * The following 3 items won't be shown on this component because the component only displays the latest 3 purchases
	 */
	mockPurchase({ id: 'wawo', title: `Wayne's World`, date: '2017/07/11', price: 9.99 }),
	mockPurchase({ id: 'cnct', title: 'Contact', date: '2017/07/10', price: 15 }),
	mockPurchase({ id: 'babo', title: 'Bad Boys', date: '2017/07/09', price: 5.5 })
] as api.PurchaseExtended[];

export default class BillingHistoryComponent extends React.Component<PageEntryItemProps, any> {
	state = {
		mockHasPurchases: [],
		purchasesLoaded: false,
		mockHasNoPurchases: [],
		noPurchasesLoaded: false
	};

	private getPurchases(returnPurchases: boolean) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (returnPurchases) {
					this.setState({ mockHasPurchases: mockListOfPurchases, purchasesLoaded: true });
				} else {
					this.setState({ noPurchasesLoaded: true });
				}
				resolve();
			}, MOCK_API_ROUNDTRIP_DURATION);
		});
	}

	render() {
		const { mockHasPurchases, mockHasNoPurchases, purchasesLoaded, noPurchasesLoaded } = this.state;
		return (
			<AccountPageStructure>
				<div className="account-billing">
					<section className="page-entry clearfix">
						<BillingHistory
							purchases={mockHasPurchases}
							purchasesLoaded={purchasesLoaded}
							getPurchases={() => this.getPurchases(true)}
							paymentMethods={paymentMethods}
						/>
					</section>
					<section className="page-entry clearfix">
						<BillingHistory
							purchases={mockHasNoPurchases}
							purchasesLoaded={noPurchasesLoaded}
							getPurchases={() => this.getPurchases(false)}
							paymentMethods={paymentMethods}
						/>
					</section>
				</div>
			</AccountPageStructure>
		);
	}
}
