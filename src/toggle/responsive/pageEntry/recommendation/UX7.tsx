import * as React from 'react';
import { UX7Recommendation as template } from 'shared/page/pageEntryTemplate';
import UX3Recommendation from 'toggle/responsive/pageEntry/recommendation/UX3';

export default function UX7Recommendation(props: PageEntryListProps) {
	return <UX3Recommendation {...props} />;
}

UX7Recommendation.template = template;
