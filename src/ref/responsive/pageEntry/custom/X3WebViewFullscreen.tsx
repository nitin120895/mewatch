import * as React from 'react';
import X2WebView, { X2PageEntryProps } from './X2WebView';
import { X3WebViewFullscreen as template } from 'shared/page/pageEntryTemplate';

import './X3WebViewFullscreen.scss';

/**
 * X3 Fullscreen Web View (iFrame)
 *
 * This is an alternate treatment of the X2 Web View however it's expected to be scheduled
 * within pages using the 'Web View' template. Unlike the X2 row, the X3 row doesn't allow
 * operators within Presentation Manager to choose a height.
 *
 * This component has the ability to dynamically resize the iFrame to fit the embedded
 * page's content height, or as a fallback it fills the viewport height's remaining content
 * area space (the viewport height minus the app header, and any scheduled hero rows above).
 *
 * If the embedded page is tailored it can announce its content height to this component
 * to allow the X3 to resize to fit. For this to work the embedded html needs to contain
 * the following script:
 *
 * ``` javascript
 * <script type="text/javascript">
 * function postHeight(e) { window.parent.postMessage(document.body.scrollHeight, '*'); }
 * window.onload = window.onresize = postHeight;
 * </script>
 * ```
 *
 * The 'Web View' page listens for these height announcements and passes the updated height
 * down into this component via props.
 *
 * If the embdedd content size changes after initial page load (e.g. via lazy loading or
 * through user interaction), then the embedded page is responsible for also calling the
 * `postHeight` method again when appropriate to ensure the X3 row resizes to fit the new
 * content height.
 *
 * We're using the X2 props for convenience since X3 supports a subset of those properties.
 */
export default function X3WebViewFullscreen(props: X2PageEntryProps) {
	return <X2WebView {...props} template={template} />;
}

X3WebViewFullscreen.template = template;
