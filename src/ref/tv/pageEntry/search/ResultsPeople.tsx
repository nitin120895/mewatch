import * as React from 'react';
import PeopleList from '../itemDetail/d8/D8CastCrew';
import { ResultsPeople as template } from 'shared/page/pageEntryTemplate';

export default function ResultsPeople(props: PageEntryItemProps) {
	return <PeopleList {...props} />;
}

ResultsPeople.template = template;
