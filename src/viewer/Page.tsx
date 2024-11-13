import * as React from 'react';
import TableOfContents from './ui/TableOfContents';
import { getCurrentPath, cleanPath } from './util/hashbang';
import findRoute from './util/findRoute';
import { Helmet } from 'react-helmet';
import * as cx from 'classnames';

interface PageProps {
	className?: string;
	// Pass in your react router routes e.g. `./ref/routes`
	routes: any;
}

export default class Page extends React.Component<PageProps, any> {
	private route: any;
	private parentRoute: any;
	private path: string;
	private parentPath: string;

	constructor(props) {
		super(props);
		this.determineRoute(this.props);
	}

	shouldComponentUpdate(nextProps: PageProps) {
		const hasRoute = this.determineRoute(nextProps);
		return hasRoute || nextProps.routes !== this.props.routes;
	}

	private determineRoute(props) {
		const path = cleanPath(getCurrentPath()).substr(1);
		const parts = path.split('/');
		const parentPath = '/' + parts.slice(1, parts.length - 1).join('/');
		const parentRoute = findRoute(parentPath, props.routes);
		const route =
			path === '/' || !parentRoute
				? parentRoute
				: findRoute(path, parentRoute, parentPath.substr(0, parentPath.lastIndexOf(parentRoute.path)));

		if (route) {
			this.route = route;
			this.parentRoute = parentRoute;
			this.path = path;
			this.parentPath = parentPath;
		}

		return !!route;
	}

	render() {
		const classes = cx('component-page', this.props.className);
		if (!this.route) {
			// If we don't have a matching route we need to allow rendering of the wildcard route
			return this.render404(classes);
		}
		return (
			<div className={classes}>
				<Helmet titleTemplate={`%s`} title={this.route.title} />
				<h2 className="page-title">{this.route.title}</h2>
				<hr className="page-title-divider" />
				<TableOfContents
					path={this.path}
					parentPath={this.parentPath}
					route={this.route}
					parentRoute={this.parentRoute}
				/>
				<hr className="page-content-divider" />
				{this.props.children}
			</div>
		);
	}

	render404(classes) {
		return <div className={classes}>{this.props.children}</div>;
	}
}
