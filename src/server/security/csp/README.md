# Content Security Policy

**Setting a secure CSP can be an effective MITIGATION against Cross Site Scripting (XSS) attacks.**

> This feature is off by default and can be enabled via the `FF_CSP=true` feature flag within your environment variables.

**We strongly recommend enabling this feature.**

When enabled, by default we restrict everything, then selectively whitelist allowed domains and elements (only those we need).

This is the most secure technique and also generates a smaller header size since rules sadly don't inherit whitelisting from the default rule and would thus cause repetition.

> The CSP is defined within [`/server/security/csp.ts`](./csp.ts).

If you're unfamiliar with CSP or need a refresher check out Google's [CSP Fundamantals](https://developers.google.com/web/fundamentals/security/csp/).

### Caveats

There is a balancing act between securing your site and being permissive enough to support common third party services.

Our developers control what's allowed via the CSP, however in some cases a customer can schedule external resources via Presentation Manager so be mindful of this when configuring your whitelist.

> **Note that locking down certain rules will limit what customers can schedule within some entry rows within Presentation Manager!**
_For example `child-src` & `frame-src` will limit what customers can schedule within the 'iFrame' Page Entry Row._

When whitelisting a source for _iframes_ you ideally need to include it within both `child-src` and `frame-src`.
`frame-src` was defined in CSP level 1, then deprecated in level 2 in favour of the newer `child-src`, then _undeprecated_ in level 3 and preferred despite maintaing support for `child-src`.

### Third Party Services

> **You choose which services to enable via environment variables.**

Third party services can be easily enabled within the CSP whitelist by declaring and adding a directives modifier.

Each modifier is responsible for enabling all (sub)domains required for using each service.
Enablement may involve modifying a single rule or multiple rules.

These modifiers alter the passed in directives object to add their required domains.

#### Enablement

Some common services are included within the [`/server/security/csp/`](./csp/) folder to serve as an example. Add your own for any additional services you wish to support.

Services are grouped together by use case. You can enable one or more services per group. Each group is optional.
Refer to [`/server/security/thirdparty.ts`](./thirdparty.ts).

**Example:**
```
CSP_ANALYTICS=googleXhr,nielsen
CSP_PAYMENT_GATEWAYS=braintree
```

### Nonces

CSP Level 2 allows execution of selective inline scripts and styles through the use of _nonces_.

Because server-side rendering inlines various scripts and styles we can leverage _nonces_ to allow executing our code and ensure any potentially injected code is blocked from executing.

* When false `unsafe-inline` is set to support server-side rendering.
* When true nonces will be leveraged within the CSP and our server rendered markup.

Even with nonces enabled injected code _could_ be run via a Dangling Markup Injection attack. We counteract that within `formatCspHtml`.

Note that browser support for level 2 is [limited](http://caniuse.com/#feat=contentsecuritypolicy2).

When nonces are used _scripts_ and/or _styles_ will have their execution blocked unless:

* inline code use a nonce value which matches the nonce set within the header.
* external files are loaded from a domain included within the header whitelist.

### Considerations when authoring React Components

**When nonces are enabled for styling you'll need to make considerations when authoring your React components.**

For CSS, if the `style-src` _doesn't_ include `unsafe-inline` this implacts **style elements** and **style attributes**. _They can't be decoupled._

> A nonce value can be used to whitelist a style element, but there isn't any way to use a nonce value on a style attribute!

Inline styles will be **blocked** under the following situations:

1. Any `<style></style>` element which _doesn't_ have the correct _nonce_ value.
1. Any style element assigned in the markup e.g. `<div style="color: red" />`. _This will impact how you write your JSX!_.

> _However we **can safely** assign inline styling via Javascript!_

Inline styles will be **allowed** under the following situations:

1. You can assign inline styles directly on an element reference via Javascript e.g. `div.style.color = 'red';`.
	_You can use this technique instead of assigning inline styles via JSX_.

The **_preferred approach_** is to manipulate your styling via **style classes**.

Class styles can be added/removed under the following situations:

1. In JSX you can assign your className values e.g. `<div className="redText" />`.
	> _This is the React way and is thus the preferred approach_.
1. In Javascript you can add/remove classes via an element reference e.g. `div.classList.add('redText')`.
	> _This bypasses React and should be used sparingly_.


### Further Reading

For more information see:

[https://content-security-policy.com/](https://content-security-policy.com/)
[https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/)
[https://blog.mozilla.org/security/2014/10/04/csp-for-the-web-we-have/](https://blog.mozilla.org/security/2014/10/04/csp-for-the-web-we-have/)
[http://blog.innerht.ml/csp-2015/](http://blog.innerht.ml/csp-2015/)
[https://embedthis.com/blog/posts/content-security-policy/](https://embedthis.com/blog/posts/content-security-policy/)
[http://githubengineering.com/githubs-csp-journey/](http://githubengineering.com/githubs-csp-journey/)
[https://githubengineering.com/githubs-post-csp-journey/](https://githubengineering.com/githubs-post-csp-journey/)
[https://blogs.dropbox.com/tech/2015/09/unsafe-inline-and-nonce-deployment/](https://blogs.dropbox.com/tech/2015/09/unsafe-inline-and-nonce-deployment/)
[https://report-uri.io/](https://report-uri.io/)
