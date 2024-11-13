import * as React from 'react';
import SidePanelOverlay from 'shared/component/SidePanelOverlay';
import NavLinks from 'viewer/ui/NavLinks';
import routes from 'viewer/ref/routes';
import { Bem } from 'shared/util/styles';

const websiteUrl = process.env.WEBSITE_URL || '/';

interface SideNavigationProps extends React.HTMLProps<any> {
	visible: boolean;
	onDismiss?: any;
	activePagePath?: string;
}

// All the child page routes, maintaining hierarchy
const links: ReactRouter.PlainRoute[] = routes.childRoutes.filter(route => route.path !== '*');
const bemT = new Bem('toc');
const bemN = new Bem('nav');

export default class SideNavigation extends React.Component<SideNavigationProps, any> {
	blockClicks = e => e.stopPropagation();
	hide = e => this.props.onDismiss();

	render() {
		const { visible, onDismiss, activePagePath } = this.props;
		return (
			<SidePanelOverlay defaultClassName={bemN.b()} visible={visible} onDismiss={onDismiss}>
				<div className={bemT.b()}>
					<h3 className={bemT.e('heading')}>Component Pages</h3>
					<NavLinks links={links} parentPath={'#'} className={bemT.e('links')} activePagePath={activePagePath} />
					<h3 className={bemT.e('heading')}>Application</h3>
					<a className={bemN.e('link', 'app')} href={websiteUrl} target="inner" onClick={this.hide}>
						Sandboxed Application
					</a>
				</div>
			</SidePanelOverlay>
		);
	}
}
