import * as React from 'react';
import { configPage } from 'shared/';
import { WebView as template } from 'shared/page/pageTemplate';
import { X3WebViewFullscreen as X3 } from 'shared/page/pageEntryTemplate';
import { Bem } from 'shared/util/styles';
import entryRenderers from 'toggle/responsive/page/webview/webViewEntries';
import './WebView.scss';

interface WebViewState {
	iFrameContentHeight: number;
}

const bem = new Bem('pg-webview');

export class WebView extends React.Component<PageProps, WebViewState> {
	constructor(props) {
		super(props);
		this.state = {
			iFrameContentHeight: undefined
		};
	}

	componentDidMount() {
		window.addEventListener('message', this.onIframeMessageReceived, false);
	}

	componentWillUnmount() {
		window.removeEventListener('message', this.onIframeMessageReceived);
	}

	private onLinkChange = () => {
		this.setState({ iFrameContentHeight: undefined });
	};

	private onIframeMessageReceived = (e: MessageEvent) => {
		// Normally we would check `e.origin` to ensure it matches our expected whitelist domains,
		// however that's problematic in this case because we can't expect our Presentation Manager
		// operators to always host their html documents on the same domain.
		// Instead we're enforcing a numeral to avoid passing potentially malcious external messages
		// into our application.
		if (Number(e.data)) {
			this.setState({ iFrameContentHeight: Number(e.data) || 0 });
		}
	};

	private renderEntries({ entries, renderEntry }: PageProps) {
		return (entries || []).map((entry, index) => {
			const customProps: any = {};
			if (entry.template === X3) {
				customProps.height = this.state.iFrameContentHeight;
				customProps.onLinkChange = this.onLinkChange;
			}
			return renderEntry(entry, index, customProps);
		});
	}

	render() {
		const hasKnownHeight = this.state.iFrameContentHeight > 1;
		return <div className={bem.b({ vp: !hasKnownHeight })}>{this.renderEntries(this.props)}</div>;
	}
}

export default configPage(WebView, {
	template,
	entryRenderers
});
