import * as React from 'react';
import T1Standard from '../../tile/T1Standard';
import { D5RecommendationsTile as template } from 'shared/page/pageEntryTemplate';

export default function D5RecommendationsTile(props: PageEntryListProps) {
	return <T1Standard {...props} />;
}

D5RecommendationsTile.template = template;
