import * as React from 'react';
import NavLinks from './NavLinks';
import { Bem } from 'shared/util/styles';

const bem = new Bem('nav-item');

export default props => {
	const { link, parentPath, activePagePath } = props;
	const { path, title, childRoutes } = link;
	const url = `${parentPath}/${path}`;
	const active = url === activePagePath;
	const classes = bem.e('link', { active });
	return (
		<li className={bem.b()}>
			<a href={url} className={classes}>
				{title}
			</a>
			{childRoutes && (
				<NavLinks links={childRoutes} parentPath={`${parentPath}/${path}`} activePagePath={activePagePath} />
			)}
		</li>
	);
};
