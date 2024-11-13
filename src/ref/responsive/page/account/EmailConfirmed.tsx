import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { ConfirmEmail as key } from 'shared/page/pageKey';

const EmailConfirmed = (props: PageProps) => <div>EmailConfirmed</div>;

export default configPage(EmailConfirmed, { theme: 'account', template, key });
