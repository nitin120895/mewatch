import * as React from 'react';
import { configPage } from 'shared/';
import { SignIn as key } from 'shared/page/pageKey';
import { STATIC as template } from 'shared/page/pageTemplate';
import SSOTemplate from 'toggle/responsive/page/auth/SSOTemplate';
import { SignupSteps } from 'toggle/responsive/pageEntry/account/accountUtils';
import { get } from 'shared/util/objects';
import MeConnectComponent from '../../../component/MeConnect';

interface RegistrationPageProps extends PageProps {}

class RegistrationPage extends React.PureComponent<RegistrationPageProps> {
	private isWelcomePage(): boolean {
		const step = get(this.props, 'location.query.step');
		return parseInt(step) === SignupSteps.WelcomeMessage;
	}

	render() {
		return (
			<SSOTemplate scrollableContent={true} alwaysHiddenMeConnect={this.isWelcomePage()}>
				{this.props.children}
			</SSOTemplate>
		);
	}
}

export default configPage(RegistrationPage, {
	theme: 'registration',
	key,
	template,
	entryRenderers: [SSOTemplate, MeConnectComponent]
});
