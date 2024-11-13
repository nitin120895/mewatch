import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { wrapPackshot } from 'shared/analytics/components/ItemWrapper';
import Link from 'shared/component/Link';
import './CastMember.scss';

const bem = new Bem('srp1');

interface CastMemberProps {
	item: api.ItemSummary;
	className?: string;
}

function CastMember({ item, className }: CastMemberProps) {
	const { title, path } = item;
	const firstInitial = title.charAt(0);
	const i = title.indexOf(' ');
	const lastInitial = ~i ? title.charAt(i + 1) : '';
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
				<div className={cx(bem.e('title'), 'truncate')}>{title}</div>
			</div>
		</Link>
	);
}

export default wrapPackshot(CastMember);
