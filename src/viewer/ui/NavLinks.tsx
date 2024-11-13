import * as React from 'react';
import NavLink from './NavLink';
import { Bem } from 'shared/util/styles';

const bem = new Bem('subnav');

export default class NavLinks extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			expanded: this.isDefaultExpanded(props)
		};
	}

	componentWillReceiveProps(nextProps) {
		const expanded = this.isDefaultExpanded(nextProps);
		this.setState({ expanded });
	}

	private isDefaultExpanded(props) {
		if (this.props.parentPath === '#') return true;

		const { activePagePath, parentPath } = props;
		const activePaths = activePagePath.substr(2).split('/');
		const parentPaths = parentPath.substr(2).split('/');
		const diff = parentPaths.filter((path, index) => path === activePaths[index]);

		return diff.length === parentPaths.length;
	}

	private onExpandClick = () => this.setState({ expanded: !this.state.expanded });

	render() {
		const { links, parentPath, activePagePath } = this.props;
		const { expanded } = this.state;

		return (
			<div className={bem.b({ expanded })}>
				<button className={bem.e('expand')} type="button" onClick={this.onExpandClick}>
					{expanded ? '-' : '+'}
				</button>
				<ul className={bem.e('list')}>
					{links.map(link => (
						<NavLink key={link.path} link={link} parentPath={parentPath} activePagePath={activePagePath} />
					))}
				</ul>
			</div>
		);
	}
}
