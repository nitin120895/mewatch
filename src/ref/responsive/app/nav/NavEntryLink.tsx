import * as React from 'react';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getEntryDepthModifier } from 'shared/app/navUtil';
import * as cx from 'classnames';
import { FULLSCREEN_QUERY_PARAM } from 'toggle/responsive/util/playerUtil';

import './NavEntryLink.scss';

interface NavEntryLinkProps {
	className?: string;
	entry: api.NavEntry;
	focusable?: boolean;
	renderLabel?: (entry: api.NavEntry) => any;
	onClick?: (entry: api.NavEntry, event: any) => void;
}

const bem = new Bem('nav-entry-link');

export default class NavEntryLink extends React.PureComponent<NavEntryLinkProps, any> {
	static defaultProps = {
		focusable: true
	};

	private onClick = e => {
		this.props.onClick(this.props.entry, e);
	};

	render() {
		const { className, focusable, onClick, entry } = this.props;
		let { label, path } = entry;
		if (!label) return false;
		const blockClassName = bem.b(getEntryDepthModifier(entry.depth), { disabled: !path });
		const props = {
			role: 'menuitem',
			className: cx(blockClassName, 'truncate', className),
			tabIndex: focusable ? undefined : -1,
			onClick: onClick ? this.onClick : undefined
		};
		if (path) {
			if (path.indexOf('/channels/') !== -1) path += `?${FULLSCREEN_QUERY_PARAM}`;
			return (
				<Link to={path} {...props}>
					{this.renderLabel()}
				</Link>
			);
		}
		return <label className={props.className}>{this.renderLabel()}</label>;
	}

	private renderLabel() {
		const { renderLabel, entry } = this.props;
		if (renderLabel) {
			return renderLabel(entry);
		}
		return <IntlFormatter>{entry.label}</IntlFormatter>;
	}
}
