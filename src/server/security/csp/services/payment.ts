import { UNSAFE_INLINE, DATA } from '../policy';

/**
 * You opt in to supported payment provider services by using the matching
 * key value(s) within the `CSP_PAYMENT_GATEWAYS` environment variable.
 *
 * e.g. `CSP_PAYMENT_GATEWAYS=stripe`
 *
 * To add your own simply declare a CspDirectivesModifier function
 * and map it to a key for use within your env variables.
 */
const PAYMENT_SERVICES: CspDirectivesModifierLookup = {
	adyen: allowAdyenPaymentGateway,
	stripe: allowStripePaymentGateway,
	braintree: allowBraintreePaymentGateway,
	braintreeSandbox: allowBraintreeSandbox
};

export default PAYMENT_SERVICES;

/**
 * Whitelist domains associated with payment gateways
 *
 * If a service requires a common sub domain which may be shared
 * by several microservices then ensure you check for its existance
 * before injecting it into the array.
 */
function allowAdyenPaymentGateway(directives: CspDirectives) {
	const whitelist = ['*.adyen.com'];
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(whitelist);

	const imgSrc = directives.imgSrc || [];
	directives.imgSrc = imgSrc.concat(whitelist);
}

// Allow Stripe
function allowStripePaymentGateway(directives: CspDirectives) {
	// https://stripe.com/docs/security
	const whitelist = ['js.stripe.com'];
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(['api.stripe.com']);
	const frameSrc = directives.frameSrc || [];
	if (frameSrc.length && frameSrc[0] !== '*') {
		directives.frameSrc = frameSrc.concat(whitelist);
	}
	const scriptSrc = directives.scriptSrc || [];
	directives.scriptSrc = scriptSrc.concat(whitelist);
}

// Allow Braintree
function allowBraintreePaymentGateway(directives: CspDirectives) {
	// http://braintree.github.io/braintree-web/current/
	const scriptSrc = directives.scriptSrc || [];
	directives.scriptSrc = scriptSrc.concat([
		'js.braintreegateway.com',
		'assets.braintreegateway.com',
		'www.paypalobjects.com'
	]);
	const styleSrc = directives.styleSrc || [];
	if (!~styleSrc.indexOf(UNSAFE_INLINE)) {
		directives.styleSrc = [UNSAFE_INLINE].concat(styleSrc);
	}
	let imgSrc = directives.imgSrc || [];
	if (~!imgSrc.indexOf(DATA)) {
		imgSrc = [DATA].concat(imgSrc);
	}
	directives.imgSrc = imgSrc.concat(['assets.braintreegateway.com', 'checkout.paypal.com']);
	const frameSources = ['assets.braintreegateway.com', 'c.paypal.com'];
	const frameSrc = directives.frameSrc || [];
	if (frameSrc.length && frameSrc[0] !== '*') {
		directives.frameSrc = frameSrc.concat(frameSources);
	}
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(['api.braintreegateway.com', 'client-analytics.braintreegateway.com']);
}

// Allow Braintree Sandbox mode
function allowBraintreeSandbox(directives: CspDirectives) {
	allowBraintreePaymentGateway(directives);
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat([
		'api.sandbox.braintreegateway.com',
		'client-analytics.sandbox.braintreegateway.com'
	]);
}
