import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileResetPin as key } from 'shared/page/pageKey';

const AccountProfileResetPin = (props: PageProps) => <div>AccountProfileResetPin</div>;

export default configPage(AccountProfileResetPin, { theme: 'account', template, key });
