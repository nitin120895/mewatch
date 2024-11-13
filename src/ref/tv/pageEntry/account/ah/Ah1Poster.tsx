import * as React from 'react';
import AccountHero, { AccountHeroProps } from './AccountHero';
import { Ah1Poster as template } from 'shared/page/pageEntryTemplate';

export default function Ah1Poster(props: AccountHeroProps) {
	return <AccountHero {...props} rowType={'ah1'} />;
}

Ah1Poster.template = template;
