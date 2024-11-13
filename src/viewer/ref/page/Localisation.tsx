import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { UPDATE_LOCALE } from 'shared/app/appWorkflow';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { addLocaleData, FormattedMessage, FormattedDate, FormattedNumber } from 'react-intl';
import CtaButton from 'ref/responsive/component/CtaButton';
import Link from 'shared/component/Link';

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
						One caveat is that they don't accept a custom <span className="pre">className</span> so whenever you have
						more complex requirements we recommended using the more advanced <span className="pre">IntlFormatter</span>{' '}
						component. See further details below.
					</p>
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
						The syntax is <span className="pre">{`@{message_id|defaltMessage}`}</span>.<br />
						<br />
						You can also specify default values for matching message ids by using the{' '}
						<span className="pre">defaults</span> prop, which can be useful when constructing larger more complex
						strings.
					</p>
					<pre>
						{`<IntlFormatter className='foo'>\n\t{\`@{message_id_1|Foo} & @{message_id_2|Bar}\`}\n</IntlFormatter>\n\n// <span class="foo">Tom & Jerry</span> or <span class="foo">Foo & Bar</span>`}
						<br />
						<br />
						{`<IntlFormatter elementType="p" values={{hour: duration.hour}}>\n\t{\`@{message_id_time|{hour, number} {hour, plural, =0 { } one {hour} other {hours}}}\`}\n</IntlFormatter>\n\n// <p>12 hours</p> or <p>1 hour</p>`}
						<br />
						<br />
						{`<IntlFormatter\n\telementType="p"\n\tvalues={{\n\t\thour: 1,\n\t\tminute: 23\n\t}}\n\tdefaults={{\n\t\tid_hour: '{hour, number} {hour, plural, one {hour} other {hours}}',\n\t\tid_minute: '{minute, number} {minute, plural, one {minute} other {minutes}}'\n\t}}\n>\n\t{'@{id_hour} @{id_minute}'}\n</IntlFormatter>\n\n// <p>1 hour 23 minutes</p>`}
					</pre>
					<p>
						The <span className="pre">IntlFormatter</span> also supports rendering component classes with formatted
						props:
					</p>
					<pre>
						{`<IntlFormatter\n\telementType={Link}\n\tcomponentProps={{ to: '#' }}\n\tformattedProps={{ title: '@{link_title|Click me}' }}\n>\n\t{'@{link_title|Click me}'}\n</IntlFormatter>\n\n// <Link to="#" title="Click me">Click me</Link>`}
					</pre>
					<p>
						You can also render mutiliple children within the <span className="pre">IntlFormatter</span>, any children
						of type string will be processed by the formatter.
					</p>
					<pre>
						{`<IntlFormatter>\n\t{'@{id_1|value 1}'}\n\t<div>{'@{id_2|value 2}'}</div>\n\t{'@{id_3|value 3}'}\n</IntlFormatter>\n\n// <span>value 1<div>@{id_2|value 2}</div>value 3</span>`}
					</pre>
					<p>
						Notice in the previous example, the string within the nested {'<div>'} element was not processed. In order
						to process nested elements within the <span className="pre">IntlFormatter</span>, set the{' '}
						<span className="pre">nested</span> flag to true.
					</p>
					<pre>
						{`<IntlFormatter nested>\n\t<span>{'@{id_1|Click }'}</span>\n\t<Link to="#">{'@{id_2|here}'}</Link>\n\t<span>{'@{id_1| now!}'}</span>\n</IntlFormatter>\n\n// <span><span>Click </span><a href="#">here</a><span> Now!</span></span>`}
					</pre>
				</section>
				<section className="component">
					<h2>Locales:</h2>
					<p>Select a locale to see the below example update in real time.</p>
					{this.renderLocaleOptions({ lang, updateLocale })}
				</section>
				<br />
				<section>
					<h4>FormattedMessage Examples:</h4>
					<p>
						Component String: <FormattedMessage id="greeting" tagName="em" defaultMessage="Hello" />
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
					<h4>Injected intl Examples:</h4>
					<p>{`Inline String: ${messages.greeting}`}</p>
					<p>{`Inline Date: ${intl.formatDate(Date.now())}`}</p>
					<p>{`Inline Currency: ${intl.formatNumber(50, { style: 'currency', currency: 'USD' })}`}</p>
					<h4>IntlFormatter Examples:</h4>
					<p>
						Formatting values as string/currency/date:
						<em>
							<IntlFormatter
								elementType="p"
								values={{
									product: 'coffee',
									price: {
										type: 'number',
										value: 4.3,
										formatOptions: { style: 'currency', currency: 'USD' }
									},
									date: {
										type: 'date',
										value: Date.now(),
										formatOptions: {
											weekday: 'long',
											day: 'numeric',
											month: 'long',
											hour: 'numeric',
											minute: 'numeric'
										}
									}
								}}
							>
								{`@{greeting|Hello}! @{missing_id|Our {product} costs {price} on {date}}`}
							</IntlFormatter>
						</em>
					</p>
					<p>
						Regex testing:
						<em>
							<IntlFormatter
								elementType="p"
								values={{
									numbers: 'NUMBERS',
									letters: 'LETTERS',
									punctuation: 'PUNCTUATION',
									number: {
										type: 'number',
										value: 1,
										formatOptions: {
											style: 'percent'
										}
									}
								}}
							>
								{`@{missing_id|Testing REGEX with {numbers}: 1234567890 {letters}: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWYZ {punctuation}: !#$%^&*()_+-=[];':"\`~/?} ...BETWEEN MESSAGES... @{missing_id|The second message} ...BETWEEN MESSAGES... @{missing_id|The regex works {number} of the time}`}
							</IntlFormatter>
						</em>
					</p>
					<p>
						Defaults in props:
						<em>
							<IntlFormatter
								elementType="p"
								values={{ hour: 1, minute: 23 }}
								defaults={{
									id_hour: '{hour, number} {hour, plural, one {hour} other {hours}}',
									id_minute: '{minute, number} {minute, plural, one {minute} other {minutes}}'
								}}
							>
								{'@{id_hour} @{id_minute}'}
							</IntlFormatter>
						</em>
					</p>
					<p>
						Using component class:
						<br />
						<em>
							<IntlFormatter
								elementType={Link}
								componentProps={{ to: '#' }}
								formattedProps={{ title: '@{link_title|Click me}' }}
							>
								{'@{link_title|Click me}'}
							</IntlFormatter>
						</em>
					</p>
					<p>
						Using multiple nested children:
						<br />
						<em>
							<IntlFormatter nested>
								{'@{id_1|Click }'}
								<span>
									{'@{id_2|on }'}
									<span>
										{'@{id_3|this }'}
										<Link to="#">{'@{id_2|link}'}</Link>
										{'@{id_4| to}'}
									</span>
									{'@{id_5| go}'}
								</span>
								{'@{id_6| nowhere}'}
							</IntlFormatter>
						</em>
					</p>
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
						ordinal="primary"
						disabled={locale === lang}
						key={locale}
						id={locale}
						onClick={() => {
							updateLocale(locale);
						}}
					>
						{locale}
					</CtaButton>
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
