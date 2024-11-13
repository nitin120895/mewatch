import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountPreferences as key } from 'shared/page/pageKey';

const AccountPreferences = (props: PageProps) => <div>AccountPreferences</div>;

export default configPage(AccountPreferences, { theme: 'account', template, key });
