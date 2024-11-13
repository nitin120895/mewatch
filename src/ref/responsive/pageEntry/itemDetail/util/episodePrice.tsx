import * as React from 'react';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';
import CtaButton from '../../../component/CtaButton';
import { resolvePrice } from '../../util/offer';

// Shared between GridItem / ListItem
export function renderPrice(episode, onPurchase) {
	const offers = episode.offers;
	const price = resolvePrice(offers);
	if (price)
		return (
			<CTAWrapper type={CTATypes.Offer} data={{ item: episode, title: price, offer: offers[0] }}>
				<CtaButton onClick={onPurchase} ordinal="primary" small>
					{price}
				</CtaButton>
			</CTAWrapper>
		);
	return false;
}
