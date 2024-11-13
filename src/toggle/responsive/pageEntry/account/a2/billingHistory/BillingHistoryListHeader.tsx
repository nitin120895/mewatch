import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './BillingHistoryListHeader.scss';

interface Props {
	classname: string;
}

const bem = new Bem('billing-list-header');

export default function BillingHistoryListHeader({ classname }: Props) {
	return (
		<div className={cx(bem.b(), classname)}>
			<IntlFormatter className="column-1" elementType="div">
				{'@{account_billing_listHeader_date|Date}'}
			</IntlFormatter>
			<IntlFormatter className="column-2" elementType="div">
				{'@{account_billing_listHeader_desc|Description}'}
			</IntlFormatter>
			<IntlFormatter className="column-3" elementType="div">
				{'@{account_billing_listHeader_method|Payment Method}'}
			</IntlFormatter>
			<IntlFormatter className="column-4" elementType="div">
				{'@{account_billing_listHeader_total|Total}'}
			</IntlFormatter>
		</div>
	);
}
