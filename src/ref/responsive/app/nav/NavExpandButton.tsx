import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './NavExpandButton.scss';

interface ExpandButtonProps extends React.Props<any> {
	entry: api.NavEntry;
	className?: string;
	expanded?: boolean;
	hidden?: boolean;
	onClick?: (entry: api.NavEntry) => void;
}

const bem = new Bem('nav-expand-btn');

export default class NavExpandButton extends React.Component<ExpandButtonProps, any> {
	render() {
		const { entry, className, onClick, expanded, hidden } = this.props;
		return (
			<IntlFormatter
				elementType="button"
				className={cx(bem.b(), 'key-mode-only', { 'sr-only': hidden }, className)}
				onClick={() => onClick(entry)}
				aria-expanded={expanded}
				aria-haspopup={true}
				formattedProps={{ 'aria-label': `@{nav_expand_aria|Open menu} ${entry.label}` }}
			/>
		);
	}
}
