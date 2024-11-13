import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileBookmarks as key } from 'shared/page/pageKey';

const AccountProfileBookmarks = (props: PageProps) => <div>AccountProfileBookmarks</div>;

export default configPage(AccountProfileBookmarks, { theme: 'account', template, key });
