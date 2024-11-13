import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileChangePin as key } from 'shared/page/pageKey';

const AccountProfileChangePin = (props: PageProps) => <div>AccountProfileChangePin</div>;

export default configPage(AccountProfileChangePin, { theme: 'account', template, key });
