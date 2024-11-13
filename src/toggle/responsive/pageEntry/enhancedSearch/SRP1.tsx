import * as React from 'react';
import { SRP1 as template } from 'shared/page/pageEntryTemplate';
import { get } from 'shared/util/objects';
import PeopleList from 'toggle/responsive/component/enhancedSearch/PeopleList';

export default function SRP1(props: PageEntryListProps) {
	const itemLength = get(props, 'list.items').length;
	const modifiedProps = {
		...props,
		...(itemLength > 0 && { title: props.title || 'Cast & Crew' })
	};
	return <PeopleList {...modifiedProps} />;
}

SRP1.template = template;
