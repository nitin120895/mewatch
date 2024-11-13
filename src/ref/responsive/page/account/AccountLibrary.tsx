import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountLibrary as key } from 'shared/page/pageKey';

const AccountLibrary = (props: PageProps) => <div>AccountLibrary</div>;

export default configPage(AccountLibrary, { theme: 'account', template, key });
