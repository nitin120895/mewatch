import * as React from 'react';
import { UX5Recommendation as template } from 'shared/page/pageEntryTemplate';
import UX3Recommendation from './UX3';

export default function UX5Recommendation(props: PageEntryListProps) {
	return <UX3Recommendation {...props} />;
}

UX5Recommendation.template = template;
