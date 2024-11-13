import * as React from 'react';
import Logo from 'ref/responsive/component/AxisLogo';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import { ColdStart as template } from 'shared/page/pageTemplate';
import { configPage } from 'shared/';
import { ColdStart as key, SignIn } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { browserHistory } from 'shared/util/browserHistory';
import PersonalisationSettings from './PersonalisationSettings';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';

import './ColdStart.scss';

interface StateProps {
	isSignedIn: boolean;
	signInPath: string;
}

interface DispatchProps {
	sendColdstartAnalyticsEvent: () => void;
}

type Props = PageProps & StateProps & DispatchProps;

const bem = new Bem('cold-start');

class ColdStart extends React.Component<Props, any> {
	componentDidMount() {
		const { isSignedIn, signInPath, sendColdstartAnalyticsEvent } = this.props;

		if (!isSignedIn) {
			browserHistory.push(signInPath);
		} else {
			sendColdstartAnalyticsEvent();
		}
	}

	render() {
		const { isSignedIn } = this.props;

		// Return an empty div so there wouldnt be a big flash when redirecting to sign in
		if (!isSignedIn) {
			return <div />;
		}

		return (
			<section className={bem.b()}>
				<div className={bem.e('logo-wrapper')}>
					<Link to="@home" className={bem.e('logo-link')}>
						<Logo />
					</Link>
				</div>
				<PersonalisationSettings coldStart={true} />
			</section>
		);
	}
}

const mapStateToProps = ({ account, app }: state.Root): StateProps => ({
	isSignedIn: account && account.active,
	signInPath: getPathByKey(SignIn, app.config)
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
	sendColdstartAnalyticsEvent: () => {
		dispatch(
			analyticsEvent(AnalyticsEventType.GENERIC_ANALYTICS_EVENT, {
				path: '/cold-start-welcome',
				type: 'Page'
			})
		);
	}
});

export default configPage(ColdStart, {
	theme: 'registration',
	key,
	template,
	mapStateToProps,
	mapDispatchToProps
} as any);
