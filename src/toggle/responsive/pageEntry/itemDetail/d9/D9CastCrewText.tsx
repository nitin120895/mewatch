import * as React from 'react';
import * as PropTypes from 'prop-types';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import { requiredRoles, RoleData } from '../../utils/castAndCrewUtil';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';

import './D9CastCrewText.scss';

const listBem = new Bem('d9');
const rowBem = new Bem('d9-cast-row');

const MAX_PEOPLE = 20;

interface Props extends PageEntryItemProps {
	pageKey: string;
	itemDetailCache: TPageEntryItemDetailProps<state.ItemDetailCache>['itemDetailCache'];
}

export default class D9CastCrewText extends React.PureComponent<Props> {
	static contextTypes = {
		intl: PropTypes.object.isRequired
	};

	context: {
		intl: any;
	};

	render() {
		const item = this.props.item as api.ItemDetail;
		const showCredits = this.getShowCredit(item);

		if (!item.credits.length && !showCredits.length) return false;

		return (
			<div>
				<EntryTitle {...this.props} />
				<div className={listBem.b()}>
					<table className={listBem.e('list')}>
						<tbody>{requiredRoles.map(this.renderCreditRow)}</tbody>
					</table>
				</div>
			</div>
		);
	}

	isShow(): boolean {
		const { item, pageKey } = this.props;
		return item.type === 'show' || pageKey === 'ShowDetail';
	}

	getShowCredit(item: api.ItemDetail): api.Credit[] {
		return item.show ? item.show.credits : [];
	}

	renderCreditRow = (role: RoleData) => {
		const item = this.props.item as api.ItemDetail;
		let credits: api.Credit[] = [];

		if (!item.credits.length) {
			credits = this.getShowCredit(item);
		} else {
			credits = item.credits;
		}

		const roleCredits = credits.filter(credit => credit.role === role.dataKey).slice(0, MAX_PEOPLE);
		if (!roleCredits.length) return false;
		return (
			<tr key={role.dataKey} className={rowBem.b()}>
				<IntlFormatter elementType="th" className={rowBem.e('role')} values={{ peopleCount: roleCredits.length }}>
					{role.labelKey}
				</IntlFormatter>
				<td className={rowBem.e('names')}>
					{roleCredits.map((credit, index) => this.renderLink(credit, index, role.labelKey))}
				</td>
			</tr>
		);
	};

	renderLink(credit: api.Credit, index: number, label: string) {
		const { name, path, role, character } = credit;
		const key = credit.key || `credit-${index}`;
		const labelKey = label.slice(label.indexOf('@{') + 2, label.indexOf('|'));

		const characters =
			role === 'actor' && character ? <span className={rowBem.e('character')}>{'(' + character + ')'}</span> : '';

		return (
			<CTAWrapper
				type={CTATypes.ProgramTag}
				data={{
					tagType: this.context.intl.formatMessage({ id: labelKey }, { peopleCount: 1 }),
					tagValue: name,
					item: this.props.item
				}}
				key={key}
			>
				<Link to={path} key={key} className={rowBem.e('name')}>
					{name}
					{characters}
				</Link>
			</CTAWrapper>
		);
	}
}
