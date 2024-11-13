import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfiles as key } from 'shared/page/pageKey';

const AccountProfiles = (props: PageProps) => <div>AccountProfiles</div>;

export default configPage(AccountProfiles, { theme: 'account', template, key });
