import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { ConfirmAccount as key } from 'shared/page/pageKey';

const AccountConfirmed = (props: PageProps) => <div>AccountConfirmed</div>;

export default configPage(AccountConfirmed, { theme: 'account', template, key });
