/*
 * TV performance metrics
 *
 * Usage: include this snippet in <head> section of index.html.xxx.js
 *
 *  ```
 *  <script>${require('./performance')}</script>
 *  ```
 *
 * Typical timings:
 * - startup: React app initialises its store
 * - onload: HTML `onload` event
 * - config: Rocket config has loaded
 * - initial: first render (spinner)
 * - details: page data has loaded
 * - rendered: page has rendered (some extra loading may have happened)
 */

module.exports = `
(function() {
    var t0 = new Date().getTime();
    var d = undefined;
    var ord = [];
    var times = {};
    var rendered = false;
    var pageTimer = undefined;

    function step(name) {
        if (times[name]) return;
        ord.push(name);
        times[name] = new Date().getTime();
    }

    function pageChange() {
        if (rendered) {
            rendered = false;
            t0 = new Date().getTime();
            ord = [];
            times = {};
            d.innerHTML = '---\\n' + d.innerHTML;
        }
    }

    function pageReady() {
        if (rendered) return;
        rendered = true;
        step('rendered');
        d = d || document.createElement('pre');
        d.setAttribute('style', 'z-index:9999; position:absolute; top:0; right:0; background:#666; color:#fff; font-size:16px; padding:4px;');
        d.innerHTML = ord.map(function(name) {
            return name + ': ' + ((times[name] - t0) / 1000).toFixed(2) + 's';
        }).join('\\n') + '\\n' + d.innerHTML;
        document.body.appendChild(d);
    }

    function clearPageTimer() {
        clearTimeout(pageTimer);
    }

    function setPageTimer() {
        clearPageTimer();
        pageTimer = setTimeout(function() {pageReady();}, 50);
    }

    window._PERF_ = function(store) {
        step('startup');
        return function(next) {
            return function(action) {
                var type = action.type;
                switch (type) {
                    case 's/app/GET_APP_CONFIG': step('config'); break;
                    case 'app/TRIGGER_SECONDARY_RENDER': step('initial'); break;
                    case 'page/PAGE_CHANGE': pageChange(); break;
                    case 's/app/GET_PAGE': clearPageTimer(); break;
                    case 's/app/GET_PAGE_START': clearPageTimer(); break;
                    case 'page/GET_PAGE_DETAIL': step('details'); setPageTimer(); break;
                }
                return next(action);
            }
        }
    };

    function onload() {
        step('onload');
        window.removeEventListener('load', onload);
    }
    window.addEventListener('load', onload);
})();
`;
