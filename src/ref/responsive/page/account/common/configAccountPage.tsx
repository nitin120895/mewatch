import * as React from 'react';
import configPage, { ConfigPageOptions } from 'shared/page/configPage';
import { setAppTheme } from 'shared/app/appWorkflow';
import StaticAccountPage from './StaticAccountPage';

export interface AccountPageProps extends PageProps {
	account?: api.Account;
	profile?: api.ProfileDetail | api.ProfileSummary;
	setAppTheme?: (theme: AppTheme) => void;
	theme?: AppTheme;
}

/**
 * Congigure Account Pages: a superset of `configPage`.
 *
 * Sub account pages should be wrapped by this HOC to inherit the alternate
 * styling associated with the account theme, and to automatically leverage
 * the `account` and `profile` data from this connected component.
 *
 * If the wrapped component needs access to additional connected data then
 * it should extend `AccountPageProps` and provide it's own map methods.
 */
export default function configAccountPage(
	PageComponent: React.ComponentClass<PageProps> | React.SFC<PageProps>,
	options: ConfigPageOptions,
	singleSection = true,
	dataProps: { [key: string]: any } = {}
) {
	class AccountThemedPage extends React.PureComponent<AccountPageProps, any> {
		componentWillMount() {
			if (this.props.theme !== 'account') {
				this.props.setAppTheme('account');
			}
		}

		render() {
			const component = <PageComponent key={options.key} {...this.props} {...dataProps} />;
			if (this.props.isStatic) {
				// Static account pages all have the same look and feel with a blue title header
				// section with a white content area underneath.
				return (
					<StaticAccountPage {...this.props} className="pg-account" singleSection={singleSection}>
						{component}
					</StaticAccountPage>
				);
			}
			// Dynamic pages provide their own contents
			return <div className="pg-account">{component}</div>;
		}
	}

	return configPage(AccountThemedPage, {
		theme: 'account',
		template: options.template,
		key: options.key,
		entryRenderers: options.entryRenderers,
		mapStateToProps: options.mapStateToProps || mapStateToProps,
		mapDispatchToProps: options.mapDispatchToProps || mapDispatchToProps
	});
}

function mapStateToProps(state: state.Root) {
	return {
		account: state.account.info,
		profile: state.profile.info,
		theme: state.app.theme
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setAppTheme: state => {
			dispatch(setAppTheme(state));
		}
	};
}
