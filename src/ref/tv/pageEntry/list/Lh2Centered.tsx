import * as React from 'react';
import ListHero from './ListHero';
import { Lh2Centered as template } from 'shared/page/pageEntryTemplate';

export default function Lh2Centered(props: PageEntryListProps) {
	return <ListHero {...props} rowType={'lh2'} />;
}

Lh2Centered.template = template;
