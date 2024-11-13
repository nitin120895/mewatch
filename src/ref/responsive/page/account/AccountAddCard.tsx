import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountAddCard as key } from 'shared/page/pageKey';

const AccountAddCard = (props: PageProps) => <div>AccountAddCard</div>;

export default configPage(AccountAddCard, { theme: 'account', template, key });
