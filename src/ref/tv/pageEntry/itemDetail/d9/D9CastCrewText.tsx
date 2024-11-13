import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { Offset } from 'ref/tv/util/domUtils';
import { setPaddingStyle } from 'ref/tv/util/rows';
import './D9CastCrewText.scss';

type roleType =
	| 'actor'
	| 'associateproducer'
	| 'coactor'
	| 'director'
	| 'executiveproducer'
	| 'filminglocation'
	| 'guest'
	| 'narrator'
	| 'other'
	| 'presenter'
	| 'producer'
	| 'productmanager'
	| 'thememusicby'
	| 'voice'
	| 'writer';

type indexedCredit = {
	index: number;
	data: api.Credit;
};

type indexedRef = {
	index: number;
	data: HTMLDivElement;
};

type D9CastCrewTextState = Partial<{
	isFocused: boolean;
}>;

type RoleGroup = {
	role: roleType;
	credits: indexedCredit[];
};

type RoleRefGroup = {
	role: roleType;
	parentRef: HTMLDivElement;
	creditRefs: indexedRef[];
	creditsOffset: Offset;
	creditRefsOffset: Offset[];
};

interface RoleData {
	dataKey: string;
	labelKey: string;
}

const listBem = new Bem('d9');
const rowBem = new Bem('d9-cast-row');
const focusable = false;

export default class D9CastCrewText extends React.Component<PageEntryItemProps, D9CastCrewTextState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private roleGroup: RoleGroup[] = [];
	private roleRefGroup: RoleRefGroup[] = [];
	private hasLoad = false;
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

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			dynamicHeight: true,
			height: 1,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.setState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: skipMove
		};
	}

	componentDidMount() {
		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			isFocused: isFocus
		});

		return true;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	render() {
		const item = this.props.item as api.ItemDetail;
		const credits: api.Credit[] = item.credits || [];
		if (credits.length === 0) {
			this.focusableRow.focusable = false;
			return <div />;
		}

		return (
			<div
				className={listBem.b({ focused: this.state.isFocused })}
				ref={ref => (this.ref = ref)}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				{this.props.title && <div className={listBem.e('title')}>{this.props.title}</div>}
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
		const roleCredits = credits.filter(credit => credit.role === role.dataKey).slice(0, 20);
		if (!roleCredits.length) return false;

		return (
			<tr key={role.dataKey} className={rowBem.b()}>
				<IntlFormatter elementType="td" className={cx(rowBem.e('role'))} values={{ peopleCount: roleCredits.length }}>
					{role.labelKey}
				</IntlFormatter>
				<td className={rowBem.e('names')}>
					<div className={rowBem.e('namesDiv')} ref={ref => this.onRefRow(ref, role)}>
						{roleCredits.map((c, i) => {
							return this.renderLink(c, i, i === roleCredits.length - 1);
						})}
					</div>
				</td>
			</tr>
		);
	};

	private renderLink(credit: api.Credit, index: number, isLastOne: boolean) {
		const key = credit.key || `credit-${index}`;

		return (
			<span key={key} className={rowBem.e('name')} ref={ref => this.onRefCredit(ref, credit, index)}>
				{credit.name + (isLastOne ? '' : ',')}
			</span>
		);
	}

	private onRefRow = (ref, role) => {
		if (!focusable) return;

		if (!ref || this.hasLoad) return;

		const curRefRow = this.roleRefGroup.find(s => s.role === role);
		if (!curRefRow) {
			this.roleRefGroup.push({
				role: role,
				parentRef: ref,
				creditRefs: [],
				creditsOffset: undefined,
				creditRefsOffset: []
			});
		} else {
			curRefRow.parentRef = ref;
		}
	};

	private onRefCredit = (ref, credit: api.Credit, index: number) => {
		if (!focusable) return;

		if (!ref || this.hasLoad) return;

		const role = credit.role;

		const curRefRow = this.roleRefGroup.find(s => s.role === role);
		const curRoleGroup = this.roleGroup.find(s => s.role === role);

		if (!curRefRow) {
			this.roleRefGroup.push({
				role: role,
				parentRef: undefined,
				creditRefs: [{ index, data: ref }],
				creditsOffset: undefined,
				creditRefsOffset: []
			});
		} else {
			curRefRow.creditRefs.push({ index, data: ref });
		}

		if (!curRoleGroup) {
			this.roleGroup.push({
				role: role,
				credits: [{ index, data: credit }]
			});
		} else {
			curRoleGroup.credits.push({ index, data: credit });
		}
	};
}
