// Polyfill Storage - https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage
try {
	if (!window.localStorage || !window.sessionStorage) throw 'exception';
	localStorage.setItem('test', '1');
	localStorage.removeItem('test');
} catch (e) {
	function createStorage(expiry) {
		return {
			getItem: function(sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) {
					return null;
				}
				return unescape(
					document.cookie.replace(
						new RegExp(
							'(?:^|.*;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*'
						),
						'$1'
					)
				);
			},
			key: function(nKeyId) {
				return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, '').split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
			},
			setItem: function(sKey, sValue) {
				if (!sKey) {
					return;
				}
				document.cookie = escape(sKey) + '=' + escape(sValue) + expiry + '; path=/';
				this.length = document.cookie.match(/\=/g).length;
			},
			length: 0,
			removeItem: function(sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) {
					return;
				}
				document.cookie = escape(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
				this.length--;
			},
			hasOwnProperty: function(sKey) {
				return new RegExp('(?:^|;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=').test(
					document.cookie
				);
			}
		};
	}
	if (window.localStorage !== null && window.sessionStorage !== null) {
		window.localStorage = createStorage('; expires=Tue, 19 Jan 2038 03:14:07 GMT');
		window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
		window.sessionStorage = createStorage('');
		window.sessionStorage.length = (document.cookie.match(/\=/g) || window.sessionStorage).length;
	}
}

// CustomEvent - https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
(function() {
	if (typeof window.CustomEvent === 'function') return false;

	function CustomEvent(event, params) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	}

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
})();

// Event Target polyfill for IE11
(function() {
	if (typeof window.EventTarget === 'function') return false;

	var EventTarget = function() {
		this.listeners = {};
	};

	EventTarget.prototype.listeners = null;
	EventTarget.prototype.addEventListener = function(type, callback) {
		if (!(type in this.listeners)) {
			this.listeners[type] = [];
		}
		this.listeners[type].push(callback);
	};

	EventTarget.prototype.removeEventListener = function(type, callback) {
		if (!(type in this.listeners)) {
			return;
		}
		var stack = this.listeners[type];
		for (var i = 0, l = stack.length; i < l; i++) {
			if (stack[i] === callback) {
				stack.splice(i, 1);
				return;
			}
		}
	};

	EventTarget.prototype.dispatchEvent = function(event) {
		if (!(event.type in this.listeners)) {
			return true;
		}
		var stack = this.listeners[event.type].slice();

		for (var i = 0, l = stack.length; i < l; i++) {
			stack[i].call(this, event);
		}
		return !event.defaultPrevented;
	};

	window.EventTarget = EventTarget;
})();
