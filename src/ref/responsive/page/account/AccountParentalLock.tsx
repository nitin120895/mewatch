import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountParentalLock as key } from 'shared/page/pageKey';

const AccountParentalLock = (props: PageProps) => <div>AccountParentalLock</div>;

export default configPage(AccountParentalLock, { theme: 'account', template, key });
