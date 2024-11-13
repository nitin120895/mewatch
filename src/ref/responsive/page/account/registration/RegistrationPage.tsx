import * as React from 'react';
import { configPage } from 'shared/';
import { SignIn as key } from 'shared/page/pageKey';
import { STATIC as template } from 'shared/page/pageTemplate';
import { Bem } from 'shared/util/styles';
import AxisLogo from '../../../component/AxisLogo';
import Link from 'shared/component/Link';

const bem = new Bem('registration-pg');

import './RegistrationPage.scss';

interface RegistrationPageProps extends PageProps {}

/*
 * This is a placeholder and it only includes the first step within the registration flow for now.
 */

class RegistrationPage extends React.Component<RegistrationPageProps, any> {
	render() {
		return (
			<section className={bem.b()}>
				<div className={bem.e('logo-wrapper')}>
					<Link to="@home" className={bem.e('logo-link')}>
						<AxisLogo id="axis-logo-signin" />
					</Link>
				</div>
				<div className={bem.e('form')}>{this.props.children}</div>
			</section>
		);
	}
}

export default configPage(RegistrationPage, {
	theme: 'registration',
	key,
	template
});
