import * as React from 'react';
import { UX6Recommendation as template } from 'shared/page/pageEntryTemplate';
import UX4Recommendation from './UX3';

export default function UX6Recommendation(props: PageEntryListProps) {
	return <UX4Recommendation {...props} />;
}

UX6Recommendation.template = template;
