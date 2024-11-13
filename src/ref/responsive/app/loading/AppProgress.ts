// Copyright (c) 2013-2014 Rico Sta. Cruz
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
// associated documentation files (the "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
// LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// See https://github.com/rstacruz/nprogress

require('./AppProgress.scss');

const AppProgress: any = {};

export default AppProgress;

AppProgress.version = '0.2.0';

const Settings = (AppProgress.settings = {
	minimum: 0.08,
	easing: 'linear',
	positionUsing: '',
	speed: 200,
	trickle: true,
	trickleSpeed: 200,
	showSpinner: true,
	barSelector: '[role="bar"]',
	spinnerSelector: '[role="spinner"]',
	parent: 'body',
	template: '<div class="bar" role="bar"><div class="peg"></div></div>'
});

/**
 * Updates configuration.
 *
 *		 AppProgress.configure({
 *			 minimum: 0.1
 *		 });
 */
AppProgress.configure = function(options) {
	let key, value;
	for (key in options) {
		value = options[key];
		if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
	}

	return this;
};

/**
 * Last number.
 */

AppProgress.status;

/**
 * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
 *
 *		 AppProgress.set(0.4);
 *		 AppProgress.set(1.0);
 */

AppProgress.set = function(n) {
	const started = AppProgress.isStarted();

	n = clamp(n, Settings.minimum, 1);
	AppProgress.status = n === 1 ? undefined : n;

	const progress = AppProgress.render(!started),
		bar = progress.querySelector(Settings.barSelector),
		speed = Settings.speed,
		ease = Settings.easing;

	progress.offsetWidth; /* Repaint */

	queue(function(next) {
		// Set positionUsing if it hasn't already been set
		if (Settings.positionUsing === '') Settings.positionUsing = AppProgress.getPositioningCSS();

		// Add transition
		css(bar, barPositionCSS(n, speed, ease));

		if (n === 1) {
			// Fade out
			css(progress, {
				transition: 'none',
				opacity: 1
			});
			progress.offsetWidth; /* Repaint */

			setTimeout(function() {
				css(progress, {
					transition: 'all ' + speed + 'ms linear',
					opacity: 0
				});
				setTimeout(function() {
					AppProgress.remove();
					next();
				}, speed);
			}, speed);
		} else {
			setTimeout(next, speed);
		}
	});

	return this;
};

AppProgress.isStarted = function() {
	return typeof AppProgress.status === 'number';
};

/**
 * Shows the progress bar.
 * This is the same as setting the status to 0%, except that it doesn't go backwards.
 *
 *		 AppProgress.start();
 *
 */
AppProgress.start = function() {
	if (!AppProgress.status) AppProgress.set(0);

	const work = function() {
		setTimeout(function() {
			if (!AppProgress.status) return;
			AppProgress.trickle();
			work();
		}, Settings.trickleSpeed);
	};

	if (Settings.trickle) work();

	return this;
};

/**
 * Hides the progress bar.
 * This is the *sort of* the same as setting the status to 100%, with the
 * difference being `done()` makes some placebo effect of some realistic motion.
 *
 *		 AppProgress.done();
 *
 * If `true` is passed, it will show the progress bar even if its hidden.
 *
 *		 AppProgress.done(true);
 */

AppProgress.done = function(force) {
	if (!force && !AppProgress.status) return this;

	return AppProgress.inc(0.3 + 0.5 * Math.random()).set(1);
};

/**
 * Increments by a random amount.
 */

AppProgress.inc = function(amount) {
	let n = AppProgress.status;

	if (!n) {
		return AppProgress.start();
	} else if (n > 1) {
		return;
	} else {
		if (typeof amount !== 'number') {
			if (n >= 0 && n < 0.2) {
				amount = 0.1;
			} else if (n >= 0.2 && n < 0.5) {
				amount = 0.04;
			} else if (n >= 0.5 && n < 0.8) {
				amount = 0.02;
			} else if (n >= 0.8 && n < 0.99) {
				amount = 0.005;
			} else {
				amount = 0;
			}
		}

		n = clamp(n + amount, 0, 0.994);
		return AppProgress.set(n);
	}
};

AppProgress.trickle = function() {
	return AppProgress.inc();
};

/**
 * (Internal) renders the progress bar markup based on the `template`
 * setting.
 */

AppProgress.render = function(fromStart) {
	if (AppProgress.isRendered()) return document.getElementById('apploader');

	addClass(document.documentElement, 'apploader-busy');

	const progress = document.createElement('div');
	progress.id = 'apploader';
	progress.innerHTML = Settings.template;

	const bar = progress.querySelector(Settings.barSelector),
		perc = fromStart ? '-100' : toBarPerc(AppProgress.status || 0),
		parent = document.querySelector(Settings.parent);
	let spinner;

	css(bar, {
		transition: 'all 0 linear',
		transform: 'translate3d(' + perc + '%,0,0)'
	});

	if (!Settings.showSpinner) {
		spinner = progress.querySelector(Settings.spinnerSelector);
		spinner && removeElement(spinner);
	}

	if (parent !== document.body) {
		addClass(parent, 'apploader-custom-parent');
	}

	parent.appendChild(progress);
	return progress;
};

/**
 * Removes the element. Opposite of render().
 */

AppProgress.remove = function() {
	removeClass(document.documentElement, 'apploader-busy');
	removeClass(document.querySelector(Settings.parent), 'apploader-custom-parent');
	const progress = document.getElementById('apploader');
	progress && removeElement(progress);
};

/**
 * Checks if the progress bar is rendered.
 */

AppProgress.isRendered = function() {
	return !!document.getElementById('apploader');
};

/**
 * Determine which positioning CSS rule to use.
 */

AppProgress.getPositioningCSS = function() {
	// Sniff on document.body.style
	const bodyStyle = document.body.style;

	// Sniff prefixes
	const vendorPrefix =
		'WebkitTransform' in bodyStyle
			? 'Webkit'
			: 'MozTransform' in bodyStyle
			? 'Moz'
			: 'msTransform' in bodyStyle
			? 'ms'
			: 'OTransform' in bodyStyle
			? 'O'
			: '';

	if (vendorPrefix + 'Perspective' in bodyStyle) {
		// Modern browsers with 3D support, e.g. Webkit, IE10
		return 'translate3d';
	} else if (vendorPrefix + 'Transform' in bodyStyle) {
		// Browsers without 3D support, e.g. IE9
		return 'translate';
	} else {
		// Browsers without translate() support, e.g. IE7-8
		return 'margin';
	}
};

/**
 * Helpers
 */

function clamp(n, min, max) {
	if (n < min) return min;
	if (n > max) return max;
	return n;
}

/**
 * (Internal) converts a percentage (`0..1`) to a bar translateX
 * percentage (`-100%..0%`).
 */

function toBarPerc(n) {
	return (-1 + n) * 100;
}

/**
 * (Internal) returns the correct CSS for changing the bar's
 * position given an n percentage, and speed and ease from Settings
 */

function barPositionCSS(n, speed, ease) {
	let barCSS;

	if (Settings.positionUsing === 'translate3d') {
		barCSS = { transform: 'translate3d(' + toBarPerc(n) + '%,0,0)' };
	} else if (Settings.positionUsing === 'translate') {
		barCSS = { transform: 'translate(' + toBarPerc(n) + '%,0)' };
	} else {
		barCSS = { 'margin-left': toBarPerc(n) + '%' };
	}

	barCSS.transition = 'all ' + speed + 'ms ' + ease;

	return barCSS;
}

/**
 * (Internal) Queues a function to be executed.
 */

const queue = (function() {
	const pending = [];

	function next() {
		const fn = pending.shift();
		if (fn) {
			fn(next);
		}
	}

	return function(fn) {
		pending.push(fn);
		if (pending.length === 1) next();
	};
})();

/**
 * (Internal) Applies css properties to an element, similar to the jQuery
 * css method.
 *
 * While this helper does assist with vendor prefixed property names, it
 * does not perform any manipulation of values prior to setting styles.
 */

const css = (function() {
	const cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'],
		cssProps = {};

	function camelCase(string) {
		return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
			return letter.toUpperCase();
		});
	}

	function getVendorProp(name) {
		const style = document.body.style;
		if (name in style) return name;

		let i = cssPrefixes.length,
			capName = name.charAt(0).toUpperCase() + name.slice(1),
			vendorName;
		while (i--) {
			vendorName = cssPrefixes[i] + capName;
			if (vendorName in style) return vendorName;
		}

		return name;
	}

	function getStyleProp(name) {
		name = camelCase(name);
		return cssProps[name] || (cssProps[name] = getVendorProp(name));
	}

	function applyCss(element, prop, value) {
		prop = getStyleProp(prop);
		element.style[prop] = value;
	}

	return function(element, properties) {
		let args = arguments,
			prop,
			value;

		if (args.length === 2) {
			for (prop in properties) {
				value = properties[prop];
				if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
			}
		} else {
			applyCss(element, args[1], args[2]);
		}
	};
})();

/**
 * (Internal) Determines if an element or space separated list of class names contains a class name.
 */

function hasClass(element, name) {
	const list = typeof element === 'string' ? element : classList(element);
	return list.indexOf(' ' + name + ' ') >= 0;
}

/**
 * (Internal) Adds a class to an element.
 */

function addClass(element, name) {
	const oldList = classList(element),
		newList = oldList + name;

	if (hasClass(oldList, name)) return;

	// Trim the opening space.
	element.className = newList.substring(1);
}

/**
 * (Internal) Removes a class from an element.
 */

function removeClass(element, name) {
	let oldList = classList(element),
		newList;

	if (!hasClass(element, name)) return;

	// Replace the class name.
	newList = oldList.replace(' ' + name + ' ', ' ');

	// Trim the opening and closing spaces.
	element.className = newList.substring(1, newList.length - 1);
}

/**
 * (Internal) Gets a space separated list of the class names on the element.
 * The list is wrapped with a single space on each end to facilitate finding
 * matches within the list.
 */

function classList(element) {
	return (' ' + ((element && element.className) || '') + ' ').replace(/\s+/gi, ' ');
}

/**
 * (Internal) Removes an element from the DOM.
 */

function removeElement(element) {
	element && element.parentNode && element.parentNode.removeChild(element);
}
