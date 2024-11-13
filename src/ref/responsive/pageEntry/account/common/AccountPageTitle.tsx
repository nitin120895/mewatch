import * as React from 'react';
import { Account as accountPageKey } from 'shared/page/pageKey';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './AccountPageTitle.scss';

const bem = new Bem('acc-pg-title');

interface AccountPageTitleProps {
	title?: string;
}

export default class AccountPageTitle extends React.Component<AccountPageTitleProps, any> {
	render() {
		const { title } = this.props;
		return (
			<div className={cx(bem.b(), 'ah-row')}>
				<IntlFormatter elementType={Link} className={bem.e('link')} componentProps={{ to: `@${accountPageKey}` }}>
					{'@{account_common_backToParent_label|Account Overview}'}
				</IntlFormatter>
				{!!title && <h1 className={cx(bem.e('heading'), 'titlecase')}>{title}</h1>}
			</div>
		);
	}
}
