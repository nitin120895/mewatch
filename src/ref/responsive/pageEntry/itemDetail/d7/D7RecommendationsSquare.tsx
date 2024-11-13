import * as React from 'react';
import S1Standard from '../../square/S1Standard';
import { D7RecommendationsSquare as template } from 'shared/page/pageEntryTemplate';

export default function D7RecommendationsSquare(props: PageEntryListProps) {
	return <S1Standard {...props} />;
}

D7RecommendationsSquare.template = template;
