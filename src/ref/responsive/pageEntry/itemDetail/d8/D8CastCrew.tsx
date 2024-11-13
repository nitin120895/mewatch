import * as React from 'react';
import PeopleList from './PeopleList';
import { D8CastCrew as template } from 'shared/page/pageEntryTemplate';

const MAX_CAST_PEOPLE = 20;

export default function D8CastCrew(props: PageEntryItemProps) {
	const item = props.item as api.ItemDetail;
	const credits: api.Credit[] = item.credits || [];
	const director = credits.filter(credit => credit.role === 'director');
	const producers = credits.filter(credit => credit.role === 'producer');
	const writers = credits.filter(credit => credit.role === 'writer');
	const actors = credits.filter(credit => credit.role === 'actor');
	const people = [...director, ...actors, ...producers, ...writers].slice(0, MAX_CAST_PEOPLE);
	return <PeopleList {...props} people={people} />;
}

D8CastCrew.template = template;
