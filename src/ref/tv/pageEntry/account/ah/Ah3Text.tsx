import * as React from 'react';
import AccountHero, { AccountHeroProps } from './AccountHero';
import { Ah3Text as template } from 'shared/page/pageEntryTemplate';

export default function Ah3Text(props: AccountHeroProps) {
	return <AccountHero {...props} rowType={'ah3'} />;
}

Ah3Text.template = template;
