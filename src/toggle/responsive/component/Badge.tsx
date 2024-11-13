import * as React from 'react';
import { Bem } from 'shared/util/styles';
import PremiumIcon from 'toggle/responsive/component/icons/premiumIcon/PremiumIcon';

enum Badges {
	Premium = 'premium'
}

interface BadgeProps {
	item: api.ItemSummary;
	className: string;
	mod?: string;
}

const bem = new Bem('premium-icon');

export default function Badge(props: BadgeProps) {
	const { item, className, mod } = props;

	if (item.badge === Badges.Premium) {
		return <PremiumIcon className={bem.b(mod)} />;
	}

	return (
		<div>
			<p className={className}>{item.badge}</p>
		</div>
	);
}
