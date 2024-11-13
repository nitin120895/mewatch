import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

export default class DropdownList extends React.Component<any, any> {
	ctrls: {
		[propName: string]: any;
	} = {};

	render() {
		const bem = new Bem(this.props.className);
		const classes = cx(bem.b(), { hidden: !this.props.display });
		return (
			<div className={classes}>
				<ul className={bem.e('ul')}>
					{this.props.list.map((item, index) => {
						return (
							<li
								className={bem.e('li')}
								ref={listItem => (this.ctrls[`listItem${index}`] = listItem)}
								key={index}
								tabIndex={0}
								onClick={e => this.props.onClick(e, item)}
								onKeyDown={e => this.props.onKeyDown(e)}
							>
								{`${item.id} - ${item.title}`}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}
