import * as React from 'react';
import X2WebView, { X2PageEntryProps } from './X2WebView';
import { X3WebViewFullscreen as template } from 'shared/page/pageEntryTemplate';

import './X3WebViewFullscreen.scss';

/**
 * XH1 Hero Web View (iFrame)
 *
 * This is an alternate treatment of the X2 Web View for scheduling at the top of a page
 * as a hero row.
 *
 * We're using the X2 props for convenience since XH1 supports a subset of those properties.
 *
 * This row will always fill the viewport width.
 */
export default function Xh1WebView(props: X2PageEntryProps) {
	props.customFields.imageWidth = 'fullWidth';
	return <X2WebView {...props} template={template} />;
}

Xh1WebView.template = template;
