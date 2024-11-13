import * as React from 'react';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { wrapPackshot } from 'shared/analytics/components/ItemWrapper';

import 'ref/responsive/pageEntry/itemDetail/d8/CastMember.scss';

const bem = new Bem('d8-cast-member');

interface CastMemberProps {
	item: api.Credit;
	className?: string;
	index?: number;
	totalCastCount?: number;
}

function CastMember({ item, className }: CastMemberProps) {
	const { character, name, path, role } = item;
	const firstInitial = name.charAt(0);
	const i = name.indexOf(' ');
	const lastInitial = ~i ? name.charAt(i + 1) : '';
	return (
		<Link to={path} className={cx(bem.b(), className)}>
			<div className={bem.e('circle-wrapper')}>
				<span>
					<div className={bem.e('circle')}>
						<div className={bem.e('initials')}>{`${firstInitial}${lastInitial}`}</div>
					</div>
				</span>
			</div>
			<div>
				<div className={cx(bem.e('actor'), 'truncate')}>{name}</div>
				{(character || role) && (
					<div className={cx(bem.e('role'), 'truncate')}>{role !== 'actor' ? role : character}</div>
				)}
			</div>
		</Link>
	);
}

export default wrapPackshot(CastMember);
