import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountChangePassword as key } from 'shared/page/pageKey';

const AccountChangePassword = (props: PageProps) => <div>AccountChangePassword</div>;

export default configPage(AccountChangePassword, { theme: 'account', template, key });
