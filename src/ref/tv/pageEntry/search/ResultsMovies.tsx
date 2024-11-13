import * as React from 'react';
import P1Standard from '../poster/P1Standard';
import { ResultsMovies as template } from 'shared/page/pageEntryTemplate';

export default function ResultsMovies(props: PageEntryListProps) {
	return <P1Standard {...props} />;
}

ResultsMovies.template = template;
