import * as React from 'react';
import PeopleList from '../itemDetail/d8/PeopleList';
import { ResultsPeople as template } from 'shared/page/pageEntryTemplate';

export default function ResultsPeople(props: PageEntryPeopleProps) {
	return <PeopleList {...props} />;
}

ResultsPeople.template = template;
