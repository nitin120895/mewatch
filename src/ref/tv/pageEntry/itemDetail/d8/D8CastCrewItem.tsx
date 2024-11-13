import * as React from 'react';
import { Bem } from 'shared/util/styles';
import './D8CastCrew.scss';

interface D8CastCrewItemProps extends React.HTMLProps<any> {
	item?: api.Credit;
	focused?: boolean;
	index?: number;
	onMouseEnter?: (index) => void;
	onClick?: (index) => void;
}

const bem = new Bem('d8-cast-crew');

export default class D8CastCrewItem extends React.Component<D8CastCrewItemProps, any> {
	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleClick = () => {
		const { onClick, index } = this.props;
		onClick && onClick(index);
	};

	render(): any {
		const { item, focused } = this.props;
		const { character, name } = item;
		const firstInitial = name.charAt(0);
		const pos = name.indexOf(' ');
		const lastInitial = pos > 0 ? name.charAt(pos + 1) : '';

		return (
			<div className={bem.e('crew-member')} onMouseEnter={this.handleMouseEnter} onClick={this.handleClick}>
				<div className={bem.e('circle', { focused })}>{`${firstInitial}${lastInitial}`}</div>
				<div className={bem.e('actor')}>{name}</div>
				<div className={bem.e('character', { focused, show: !!character })}>{character ? character : '_'}</div>
			</div>
		);
	}
}
