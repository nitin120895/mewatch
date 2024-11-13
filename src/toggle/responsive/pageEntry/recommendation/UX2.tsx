import * as React from 'react';
import { UX2Recommendation as template } from 'shared/page/pageEntryTemplate';
import UX1Recommendation from './UX1';

export default function UX2Recommendation(props: PageEntryListProps) {
	return <UX1Recommendation {...props} />;
}

UX2Recommendation.template = template;
