import * as React from 'react';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';

import './D9CastCrewText.scss';

const listBem = new Bem('d9');
const rowBem = new Bem('d9-cast-row');

const MAX_PEOPLE = 20;

interface RoleData {
	dataKey: string;
	labelKey: string;
}

export default class D9CastCrewText extends React.Component<PageEntryItemProps, any> {
	private requiredRoles: RoleData[] = [
		{
			dataKey: 'director',
			labelKey: '@{itemDetail_cast_directors_label|{peopleCount, plural, one {Director} other {Directors}}}'
		},
		{ dataKey: 'actor', labelKey: '@{itemDetail_cast_actors_label|Cast}' },
		{
			dataKey: 'producer',
			labelKey: '@{itemDetail_cast_producers_label|{peopleCount, plural, one {Producer} other {Producers}}}'
		},
		{
			dataKey: 'writer',
			labelKey: '@{itemDetail_cast_writers_label|{peopleCount, plural, one {Writer} other {Writers}}}'
		}
	];

	render() {
		return (
			<div>
				<EntryTitle {...this.props} />
				<div className={listBem.b()}>
					<table className={listBem.e('list')}>
						<tbody>{this.requiredRoles.map(this.renderCreditRow)}</tbody>
					</table>
				</div>
			</div>
		);
	}

	private renderCreditRow = (role: RoleData) => {
		const item = this.props.item as api.ItemDetail;
		const credits: api.Credit[] = item.credits || [];
		const roleCredits = credits.filter(credit => credit.role === role.dataKey).slice(0, MAX_PEOPLE);
		if (!roleCredits.length) return false;
		return (
			<tr key={role.dataKey} className={rowBem.b()}>
				<IntlFormatter elementType="th" className={rowBem.e('role')} values={{ peopleCount: roleCredits.length }}>
					{role.labelKey}
				</IntlFormatter>
				<td className={rowBem.e('names')}>{roleCredits.map(this.renderLink)}</td>
			</tr>
		);
	};

	private renderLink(credit: api.Credit, index: number) {
		const key = credit.key || `credit-${index}`;
		const character =
			credit.role === 'actor' && credit.character ? (
				<span className={rowBem.e('character')}>{'(' + credit.character + ')'}</span>
			) : (
				''
			);
		return (
			<Link to={credit.path} key={key} className={rowBem.e('name')}>
				{credit.name}
				{character}
			</Link>
		);
	}
}
