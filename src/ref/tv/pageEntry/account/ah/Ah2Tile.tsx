import * as React from 'react';
import AccountHero, { AccountHeroProps } from './AccountHero';
import { Ah2Tile as template } from 'shared/page/pageEntryTemplate';

export default function Ah2Tile(props: AccountHeroProps) {
	return <AccountHero {...props} rowType={'ah2'} />;
}

Ah2Tile.template = template;
