import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import configAccountPage, { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountPreferences as key } from 'shared/page/pageKey';
import { Account } from 'shared/page/pageKey';
import { getAccountNewsletters, subscribe } from 'shared/service/action/account';
import { resetBackNavigation } from 'shared/page/pageWorkflow';
import Checkbox from 'toggle/responsive/component/input/Checkbox';
import {
	AccountPreferencesClassification,
	getNewslettersbyClassification,
	getSubscribedNewsletters,
	getUnsubscribedNewsletters
} from 'toggle/responsive/pageEntry/account/accountUtils';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';

import './AccountPreferences.scss';

const bem = new Bem('manage-preferences');

interface State {
	newsletters: api.Newsletter[];
	unsavedNewsletters: api.Newsletter[];
	loading: boolean;
}

interface OwnProps {
	requestBackNavigation: string;
	router?: any;
	accountPath: string;
}

interface DispatchProps {
	resetBackNavigation: () => void;
	getAccountNewsletters: () => Promise<any>;
	subscribe: (newsletters: api.NewslettersSubscriptionRequest) => any;
	sendRegisterAnalyticsEvent: () => void;
}

type Props = DispatchProps & AccountPageProps & OwnProps;

class AccountPreferences extends React.Component<Props, State> {
	state: State = {
		newsletters: [],
		unsavedNewsletters: [],
		loading: true
	};

	componentDidMount() {
		this.getNewsletters();
		this.props.sendRegisterAnalyticsEvent();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.requestBackNavigation && nextProps.requestBackNavigation !== this.props.requestBackNavigation) {
			this.redirect();
		}
	}

	private getNewsletters() {
		this.props.getAccountNewsletters().then(data => {
			this.setState({
				newsletters: data.payload,
				loading: false
			});
		});
	}

	private redirect = () => {
		const { accountPath, router } = this.props;
		router.push(accountPath);
		this.props.resetBackNavigation();
		return;
	};

	private onChange = e => {
		const checkedItemCode = e.currentTarget.value;
		let { newsletters, unsavedNewsletters } = this.state;
		const unsavedNewsletter = unsavedNewsletters.find(item => item.shortCode === checkedItemCode);

		if (unsavedNewsletter) {
			unsavedNewsletter.subscribed = !unsavedNewsletter.subscribed;
		} else {
			const newsletter = { ...newsletters.find(item => item.shortCode === checkedItemCode) };
			newsletter.subscribed = !newsletter.subscribed;
			unsavedNewsletters.push(newsletter);
		}
		this.setState({ unsavedNewsletters });
	};

	private onSubmit = e => {
		e.preventDefault();
		this.setState({ loading: true });
		const { newsletters, unsavedNewsletters } = this.state;
		this.props.subscribe({ newsletters: unsavedNewsletters }).then(() => {
			let updated = newsletters.map(item => {
				let unsaved = unsavedNewsletters.find(i => i.shortCode === item.shortCode);
				return unsaved ? { ...item, subscribed: unsaved.subscribed } : item;
			});
			this.setState(
				{
					newsletters: updated,
					unsavedNewsletters: [],
					loading: false
				},
				this.redirect
			);
		});
	};

	render() {
		const { newsletters } = this.state;
		const subscribed = getSubscribedNewsletters(newsletters);
		const notsubscribed = getUnsubscribedNewsletters(newsletters);

		return (
			!!newsletters.length && (
				<div className={bem.b()}>
					<form className="form-white" onSubmit={this.onSubmit}>
						<div className={bem.e('newsletters-list')}>
							{!!subscribed.length && (
								<div className={bem.e('subscribed-section')}>
									<h3>
										<IntlFormatter>{'@{account_preferences_subscribed| Subscribed}'}</IntlFormatter>
									</h3>
									{this.renderSubscribed(subscribed)}
								</div>
							)}
							{!!notsubscribed.length && (
								<div className={bem.e('subscribed-section')}>
									<h3>
										<IntlFormatter>{'@{account_preferences_not_subscribed|Not Subscribed}'}</IntlFormatter>
									</h3>
									{this.renderUnsubscribed(notsubscribed)}
								</div>
							)}
						</div>
						<div className={bem.e('container-button')}>
							<AccountButton type={'submit'} loading={this.state.loading} className={bem.e('submit-preferences')}>
								<IntlFormatter>{'@{account_common_save_button_label| Save}'}</IntlFormatter>
							</AccountButton>
							<CtaButton ordinal="secondary" onClick={this.redirect} className="cancel">
								<IntlFormatter>{'@{account_common_cancel_button_label| Cancel}'}</IntlFormatter>
							</CtaButton>
						</div>
					</form>
				</div>
			)
		);
	}

	private renderSubscribed = newsletters => newsletters.map(item => this.renderSubscriptions(item));

	private renderUnsubscribed = newsletters => {
		const newslettersLifestyle = getNewslettersbyClassification(
			newsletters,
			AccountPreferencesClassification.LIFESTYLE
		);
		const newslettersNews = getNewslettersbyClassification(newsletters, AccountPreferencesClassification.NEWS);

		return (
			<div>
				{!!newslettersNews.length && (
					<div>
						<IntlFormatter elementType="div" className={bem.e('classification')}>
							{'@{account_preferences_news_label}'}
						</IntlFormatter>
						{newslettersNews.map(item => this.renderSubscriptions(item))}
					</div>
				)}
				{!!newslettersLifestyle.length && (
					<div>
						<IntlFormatter elementType="div" className={bem.e('classification')}>
							{'@{account_preferences_lifestyle_label}'}
						</IntlFormatter>
						{newslettersLifestyle.map(item => this.renderSubscriptions(item))}
					</div>
				)}
			</div>
		);
	};

	private renderSubscriptions = item => {
		let { unsavedNewsletters } = this.state;

		const unSaved = unsavedNewsletters.find(i => i.shortCode === item.shortCode);
		const subscribed = unSaved ? unSaved.subscribed : item.subscribed;

		return (
			<div key={item.shortCode}>
				<Checkbox
					label={item.name}
					name={item.name}
					value={item.shortCode}
					checked={subscribed}
					onChange={this.onChange}
					message={item.description}
					disabled={!item.canSubscribe}
				/>
			</div>
		);
	};
}

function mapStateToProps({ app, page }: state.Root) {
	return {
		requestBackNavigation: page.requestBackNavigation,
		accountPath: getPathByKey(Account, app.config)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		getAccountNewsletters: () => dispatch(getAccountNewsletters()),
		resetBackNavigation: () => dispatch(resetBackNavigation()),
		subscribe: newsletter => dispatch(subscribe(newsletter)),
		sendRegisterAnalyticsEvent: () => dispatch(pageAnalyticsEvent(window.location.pathname))
	};
}

const AccountPreferencesWithRouter = withRouter(AccountPreferences);

export default connect<any, any, Props>(
	mapStateToProps,
	mapDispatchToProps
)(configAccountPage(AccountPreferencesWithRouter, { theme: 'account', template, key }));
