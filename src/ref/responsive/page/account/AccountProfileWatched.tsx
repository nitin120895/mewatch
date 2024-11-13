import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileWatched as key } from 'shared/page/pageKey';

const AccountProfileWatched = (props: PageProps) => <div>AccountProfileWatched</div>;

export default configPage(AccountProfileWatched, { theme: 'account', template, key });
