import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { UPDATE_LOCALE } from 'shared/app/appWorkflow';
import { addLocaleData, FormattedMessage, FormattedDate, FormattedNumber } from 'react-intl';
import CtaButton from 'ref/tv/component/CtaButton';

/**
 * Fr module is imported manually as fr locale is hard-coded in availableLocales below for proof of concept.
 * En module does not need to be loaded as it is included in browsers by default.
 */
import * as fr from 'react-intl/locale-data/fr';
addLocaleData(ReactIntlLocaleData['fr']);

/**
 * Localisation / Internationalisation Example (i18n).
 *
 * This example uses inline string bundles for convenience to illustrate switching between locales and locale regions.
 * This is done to ensure we don't include unnecessary string values when compiling our main application.
 *
 * In your main application you would instead utilise the app's externally loaded JSON string bundles
 * via the injected `strings` prop. The `strings` prop is a shortcut reference to `props.intl.messages`.
 *
 * @see `updateLocale` & `UPDATE_LOCALE` inside 'shared/app/appWorkflow'
 * @see 'shared/app/localeUtil';
 */
class Localisation extends React.Component<any, any> {
	componentDidMount() {
		// Ensure we use our inlined mocked data for the initial render
		this.props.updateLocale('en');
	}

	shouldComponentUpdate(nextProps, nextState) {
		// Wait for our inlined props before updating
		const { messages: newMsgs } = nextProps.intl;
		if (!newMsgs.greeting) return false;
		const { messages: curMsgs } = this.props.intl;
		return newMsgs.greeting !== curMsgs.greeting;
	}

	render() {
		const { lang, updateLocale, intl } = this.props;
		const { messages } = intl;
		return (
			<main className="component">
				<section>
					<p>
						Our{' '}
						<strong>
							<em>i18n</em>
						</strong>{' '}
						support is via the <span className="pre">react-intl</span> library.
					</p>
					<p>
						The application Root uses the <span className="pre">IntlProvider</span> component to funnel down locale
						changes.
					</p>
					<p>
						Switching locales not only alters labelling, but can also adjust the format of dates, numbers and currency.
					</p>
					<h4>Usage:</h4>
					<p>
						Formatter methods can be accessed via the injected <span className="pre">intl</span> prop. e.g.
					</p>
					<pre>
						{`intl.formatDate(Date.now()); // DD/MM/YYYY or MM/DD/YYYY`}
						<br />
						{`intl.formatNumber(50, { style: 'currency', currency: 'USD' }); // $50, USD $50, etc`}
					</pre>
					<p>However most things can be automatically handled via the supplied intl components.</p>
					<pre>
						{`<FormattedMessage id="greeting" tagName="h3" /> // <h3>Hello</h3> or <h3>Bonjour</h3>`}
						<br />
						{`<FormattedDate value={new Date()} /> // <span>MM/DD/YYYY</span>`}
						<br />
						{`<FormattedNumber value={50} style="currency" currency="USD" /> // <span>$50</span>`}
					</pre>
					<p>
						Note that the intl components default to using a <span className="pre">span</span>, however you can provide
						an alternate element type for <span className="pre">FormattedMessage</span> via the{' '}
						<span className="pre">tagName</span> prop.
					</p>
					<p>
						One caveat is that they don't accept a custom <span className="pre">className</span> so when suitable it's
						recommended to provide styling on an encompassing element, or you can instead use a callback method to
						provide your own element like this:
					</p>
					<pre>
						{`<FormattedMessage id="greeting">\n{(value: string) => <p className='foo'>{value}</p>}\n</FormattedMessage>\n\n// <p class='foo'>Hello</p>`}
					</pre>
					<p>
						If you want pluralization or contextual formatting when defining your string values this can be achieved via{' '}
						<a href="https://formatjs.io/guides/message-syntax/" target="_blank">
							Message Syntax formatting
						</a>
						.
						<br />
						e.g. in the below example the value we pass is expected to be a number and is mapped to a plural category.
					</p>
					<pre>{`"{{unreadCount, number}{unreadCount, plural, one {message} other {messages}}"`}</pre>
					<p>
						Consult their{' '}
						<em style={{ textDecoration: 'underline' }}>
							<a href="https://github.com/yahoo/react-intl/wiki/Components">docs</a>
						</em>{' '}
						for more information.
					</p>
					<p>
						For convenience we've made a <span className="pre">IntlFormatter</span> HOC to simplify development. It
						matches the functionality provided by <span className="pre">FormattedMessage</span> and augments it with the
						ability to assign custom classes and also to concatenate multiple strings together into a single element
						rather than using multiple <span className="pre">FormattedMessage</span> instances.
						<br />
						<br />
						The syntax is <span className="pre">{`@{message_id|defaltMessage}`}</span>.
					</p>
					<pre>
						{`<IntlFormatter className='foo'>\n\t{\`@{message_id_1|Foo} & @{message_id_2|Bar}\`}\n</IntlFormatter>\n\n// <span class="foo">Tom & Jerry</span> or <span class="foo">Foo & Bar</span>`}
						<br />
						<br />
						{`<IntlFormatter tagName="p" values={{hour: duration.hour}}>\n\t{\`@{message_id_time|{hour, number} {hour, plural, =0 { } one {hour} other {hours_p}}}\`}\n</IntlFormatter>\n\n// <p>12 hours</p> or <p>1 hour</p>`}
					</pre>
				</section>
				<section className="component">
					<h2>Locales:</h2>
					<p>Select a locale to see the below example update in real time.</p>
					{this.renderLocaleOptions({ lang, updateLocale })}
				</section>
				<br />
				<section>
					<h4>Example:</h4>
					<p>
						Component String: <FormattedMessage id="greeting" tagName="em" />
					</p>
					<p>
						Component Date:{' '}
						<em>
							<FormattedDate value={new Date(1459832991883)} />
						</em>
					</p>
					<p>
						Component Currency:{' '}
						<em>
							<FormattedNumber value={50} style="currency" currency="USD" />
						</em>
					</p>
					<p>{`Inline String: ${messages.greeting}`}</p>
					<p>{`Inline Date: ${intl.formatDate(Date.now())}`}</p>
					<p>{`Inline Currency: ${intl.formatNumber(50, { style: 'currency', currency: 'USD' })}`}</p>
				</section>
			</main>
		);
	}

	private renderLocaleOptions = ({ lang, updateLocale }) => {
		const availableLocales = ['en', 'en-AU', 'fr'];
		addLocaleData(fr);
		return (
			<span className="btn-group">
				{availableLocales.map(locale => (
					<CtaButton
						label={locale}
						ordinal="primary"
						disabled={locale === lang}
						key={locale}
						id={locale}
						onClick={() => {
							updateLocale(locale);
						}}
					/>
				))}
			</span>
		);
	};
}

let firstRun = true;

// This is the equivalent of using `updateLocale` from inside `appWorkflow.ts`
// Here we use mock data instead of the app's regular string bundles.
function updateMockedLocale(locale: string): any {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		// Our `Root` component is shared by the component viewer and the main application
		// which means it loads the app's default locale JSON file during startup.
		// Since we're not using locales in the component viewer other than in this example
		// we replace the app's string bundle with these hard coded values.
		// To ensure the initial render is correct we allow this to run despite the 'en'
		// locale matching the existing value during first run.
		if (!firstRun && state.app.i18n.lang === locale) return;
		if (firstRun) firstRun = false;
		let strings: any;
		switch (locale) {
			case 'fr':
				strings = JSON.parse(`{"greeting": "Bonjour"}`);
				break;
			case 'en-AU':
				strings = JSON.parse(`{"greeting": "G'Day"}`);
				break;
			default:
				strings = JSON.parse(`{"greeting": "Hello"}`);
				break;
		}
		dispatch({ type: UPDATE_LOCALE, payload: { lang: locale, strings } });
	};
}

function mapDispatchToProps(dispatch) {
	return {
		updateLocale: locale => dispatch(updateMockedLocale(locale))
	};
}

function mapStateToProps(state: state.Root) {
	return {
		lang: state.app.i18n.lang,
		strings: state.app.i18n.strings
	};
}

// We wouldn't usually use Redux `connect` on Component Viewer pages, however since we're using
// the `ConnectedIntlProvider` within the shared app `Root.tsx` it's easier to use it in this case
// to ensure the locale changes funnel down correctly.
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(injectIntl(Localisation));
