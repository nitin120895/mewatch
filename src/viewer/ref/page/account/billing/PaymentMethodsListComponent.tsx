import * as React from 'react';
import AccountPageStructure from '../../entries/account/AccountPageStructure';
import { PaymentMethods } from 'ref/responsive/pageEntry/account/a2/paymentMethods/PaymentMethods';

export const threePaymentMethods = {
	defaultPaymentMethodId: 'cf27bf89-98d0-4b62-ad6f-725e7a688686',
	paymentMethods: [
		{
			description: 'Visa (**** 0006, exp 08/19)',
			expiryMonth: 8,
			expiryYear: 2019,
			id: 'cf27bf89-98d0-4b62-ad6f-725e7a688686',
			type: 'Card',
			brand: 'Visa',
			lastDigits: 6
		},
		{
			description: 'Visa (**** 0078, exp 10/21)',
			expiryMonth: 10,
			expiryYear: 2021,
			id: 'cf27bf89-98d0-4b62-ad6f-9823y492384',
			type: 'Card',
			brand: 'Mastercard',
			lastDigits: 78
		},
		{
			description: 'Visa (**** 0078, exp 10/21)',
			expiryMonth: 1,
			expiryYear: 2018,
			id: 'cf27bisdjf9-230-98d0-4b62-ad6f-9823y492384',
			type: 'Card',
			brand: 'Visa',
			lastDigits: 78
		}
	] as api.PaymentMethod[]
};

const onePaymentMethod = {
	defaultPaymentMethodId: 'cf27bf89-98d0-4b62-ad6f-725e7a688686',
	paymentMethods: [
		{
			description: 'Visa (**** 0078, exp 10/21)',
			expiryMonth: 10,
			expiryYear: 2021,
			id: 'cf27bf89-98d0-4b62-ad6f-725e7a688686',
			type: 'Card',
			brand: 'AmericanExpress',
			lastDigits: 78
		}
	] as api.PaymentMethod[]
};

const noPaymentMethod = {
	defaultPaymentMethodId: 'cf27bf89-98d0-4b62-ad6f-725e7a688686',
	paymentMethods: []
};

export default class PaymentMethodsListComponent extends React.Component<PageEntryItemProps, any> {
	render() {
		return (
			<AccountPageStructure>
				<div className="account-billing">
					<section className="page-entry clearfix">
						<PaymentMethods {...threePaymentMethods} />
					</section>
					<section className="page-entry clearfix">
						<PaymentMethods {...onePaymentMethod} />
					</section>
					<section className="page-entry clearfix">
						<PaymentMethods {...noPaymentMethod} />
					</section>
				</div>
			</AccountPageStructure>
		);
	}
}
