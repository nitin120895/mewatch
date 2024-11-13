import * as React from 'react';
import { UX8Recommendation as template } from 'shared/page/pageEntryTemplate';
import P1Standard from 'toggle/responsive/pageEntry/poster/P1Standard';

export default function UX8Recommendation(props: PageEntryListProps) {
	return <P1Standard {...props} />;
}

UX8Recommendation.template = template;
