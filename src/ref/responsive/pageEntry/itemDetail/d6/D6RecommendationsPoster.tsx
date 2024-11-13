import * as React from 'react';
import P1Standard from '../../poster/P1Standard';
import { D6RecommendationsPoster as template } from 'shared/page/pageEntryTemplate';

export default function D6RecommendationsPoster(props: PageEntryListProps) {
	return <P1Standard {...props} />;
}

D6RecommendationsPoster.template = template;
