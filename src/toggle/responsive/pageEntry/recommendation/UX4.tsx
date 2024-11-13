import * as React from 'react';
import { UX4Recommendation as template } from 'shared/page/pageEntryTemplate';
import UX3Recommendation from './UX3';

export default function UX4Recommendation(props: PageEntryListProps) {
	return <UX3Recommendation {...props} />;
}

UX4Recommendation.template = template;
