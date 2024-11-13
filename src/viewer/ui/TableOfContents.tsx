import * as React from 'react';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';

const bem = new Bem('toc');

interface TableOfContentsProps extends React.Props<any> {
	route: ReactRouter.PlainRoute;
	parentRoute: ReactRouter.PlainRoute;
	path: string;
	parentPath: string;
}

export default class TableOfContents extends React.PureComponent<TableOfContentsProps, any> {
	hasChildRoutes(route) {
		return route && route.childRoutes && route.childRoutes.length > 0;
	}

	filterChildRoutes(route) {
		if (this.hasChildRoutes(route)) {
			return route.childRoutes.filter(r => r.path !== '*');
		}
		return [];
	}

	render() {
		const { route, parentRoute, path, parentPath } = this.props;
		const routes = this.filterChildRoutes(route);
		return (
			<ul className={bem.b()}>
				{route !== parentRoute ? this.renderLink(parentRoute, parentPath, true) : undefined}
				{this.renderLinks(routes, path)}
			</ul>
		);
	}

	private renderLink(route, path, isParent = false) {
		const label = isParent ? `${route.path === '/' ? '< Home' : '< Parent'}` : route.title;
		return (
			<li key={route.path} className={isParent ? 'parent-link' : undefined}>
				<Link to={path} className={bem.e('link')}>
					{label}
				</Link>
			</li>
		);
	}

	private renderLinks(routes, path) {
		if (!routes || !routes.length) return undefined;
		return routes.map((route, i) => {
			const pathTo = path && path !== '/' ? `${path}/${route.path}` : `/${route.path}`;
			return this.renderLink(route, pathTo);
		});
	}
}
