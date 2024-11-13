import * as React from 'react';
import ListHero from './ListHero';
import { Lh1Standard as template } from 'shared/page/pageEntryTemplate';

export default function Lh1Standard(props: PageEntryListProps) {
	return <ListHero {...props} rowType={'lh1'} />;
}

Lh1Standard.template = template;
