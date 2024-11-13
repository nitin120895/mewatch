let BlazeSDK;

if (typeof window !== 'undefined' && !_SSR_) {
	// not in SSR mode
	BlazeSDK = require('@wscsports/blaze-web-sdk');
}

export default BlazeSDK;
