import * as React from 'react';
import { connect } from 'react-redux';
import PageGuard from 'shared/component/PageGuard';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import { Bem } from 'shared/util/styles';
import BodyTheme from 'ref/responsive/util/BodyTheme';

import './AppChromeless.scss';

const bem = new Bem('chromeless');
const bodyTheme = new BodyTheme();

interface AppChromelessProps {
	theme: AppTheme;
	children?: any;
}

class AppChromeless extends React.Component<AppChromelessProps> {
	componentDidMount() {
		bodyTheme.set(this.props.theme);
	}

	componentWillReceiveProps(nextProps: AppChromelessProps) {
		if (nextProps.theme !== this.props.theme) bodyTheme.set(nextProps.theme);
	}

	componentWillUnmount() {
		bodyTheme.set('default');
	}

	render() {
		const { children, theme } = this.props;
		return (
			<div className={bem.b(theme)}>
				<div className="content">
					<PageGuard redirectPath="/" isRestricted={isRestrictedPage}>
						<main className="main">{children}</main>
					</PageGuard>
				</div>
			</div>
		);
	}
}

function mapStateToProps({ app }: state.Root): AppChromelessProps {
	return {
		theme: app.theme
	};
}

export default connect<any, any, AppChromelessProps>(mapStateToProps)(AppChromeless);
