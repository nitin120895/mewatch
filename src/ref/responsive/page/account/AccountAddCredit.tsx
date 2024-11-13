import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountAddCredit as key } from 'shared/page/pageKey';

const AccountAddCredit = (props: PageProps) => {
	return <div>AccountAddCredit</div>;
};

export default configPage(AccountAddCredit, { theme: 'account', template, key });
