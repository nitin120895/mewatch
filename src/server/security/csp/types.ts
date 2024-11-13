type CspDirectives = {
	// Fetch
	prefetchSrc?: string[];
	childSrc?: string[];
	connectSrc?: string[];
	defaultSrc: string[];
	fontSrc?: string[];
	frameSrc?: string[];
	imgSrc?: string[];
	manifestSrc?: string[];
	mediaSrc?: string[];
	objectSrc?: string[];
	scriptSrc?: any[];
	styleSrc?: any[];
	workerSrc?: any[];
	// Document
	baseUri?: string[];
	pluginTypes?: string[];
	sandbox?: string[];
	// Navigation
	formAction?: string[];
	frameAncestors?: string[];
	// Reporting
	reportUri?: string;
};

type CspDirectivesModifier = (directives: CspDirectives) => any;

interface CspDirectivesModifierLookup {
	[key: string]: CspDirectivesModifier;
}
