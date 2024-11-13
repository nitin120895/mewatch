import * as React from 'react';
import { WebView } from 'ref/responsive/page/webview/WebView';
import X2WebView from 'ref/responsive/pageEntry/custom/X2WebView';
import X3WebViewFullscreen from 'ref/responsive/pageEntry/custom/X3WebViewFullscreen';
import { X2WebView as X2TemplateKey, X3WebViewFullscreen as X3TemplateKey } from 'shared/page/pageEntryTemplate';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import CollapsibleFieldSet from 'viewer/ui/CollapsibleFieldSet';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import TitledComponent from 'viewer/ref/component/TitledComponent';
import * as cx from 'classnames';

const mock: any = {
	images: {},
	list: undefined,
	savedState: {},
	template: X2TemplateKey,
	title: '',
	customFields: {},
	id: '',
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	}
};

// For video embeds, please consult the third party API documentation to provide the best user experience.
// e.g. for YouTube we can leverage query parameters to enhance the player chrome and accessibility.
// https://developers.google.com/youtube/player_parameters#Parameters
// Additionally YouTube provide the youtube-nocookie.com domain which can help in local development testing
// if you're suffering from CORS.

const defaultX2Link =
	'https://www.youtube-nocookie.com/embed/nohQReM7BpI?disablekb=0&modestbranding=1&fs=0&showinfo=0&rel=0';
const defaultX3Link = 'https://widgets.massiveaxis.com/axis/webview/premiere-league-table.html';

const EMBED_CODE_SNIPPET = `
<script type="text/javascript">
function postHeight(e) {
	window.parent.postMessage(document.body.scrollHeight, '*');
}
window.onload = postHeight;
window.onresize = postHeight;
}
</script>
`;

export default class WebViewComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			template: X2TemplateKey,
			showReferenceRows: false,
			imageWidth: 'contentWidth',
			widthPercentage: 70,
			imageHorizontalAlignment: 'center',
			imageVerticalSpacing: 'default',
			link: defaultX2Link,
			title: 'Web View',
			tagline: '',
			hideTitles: false,
			aspectRatio: '16x9',
			pixelHeight: 360
		};
	}

	private onChange = e => {
		let { name, value } = e.target;
		if (name === 'widthPercentage') value = Number(value);
		const state: any = { [name]: value };
		if (name === 'imageVerticalSpacing') {
			// `imageVerticalSpacing` requires adjacent content to demonstrate how it works
			state.showReferenceRows = value !== 'default';
		} else if (name === 'template') {
			if (value === X3TemplateKey) {
				// Reset when changing from X2 to X3
				state.showReferenceRows = false;
				state.hideTitles = false;
				state.imageHorizontalAlignment = 'center';
				state.imageVerticalSpacing = 'default';
				// Example of suitable constructed page for fixed height resizing.
				state.link = defaultX3Link;
			} else if (this.state.link === defaultX3Link) {
				// Restore
				state.link = defaultX2Link;
			}
		}
		this.setState(state);
	};

	private onChkChange = e => {
		let { name, checked } = e.target;
		this.setState({ [name]: checked });
	};

	private onListChange = list => {
		this.setState({ list });
	};

	render() {
		const { list, hideTitles, showReferenceRows } = this.state;
		const refProps = showReferenceRows
			? Object.assign({}, mock, {
					list,
					template: 'P1',
					title: 'P1 Reference',
					className: hideTitles ? 'row-title-hidden' : ''
			  })
			: undefined;
		return (
			<div>
				<ListSearch label="Adjacent Content Data" onListChange={this.onListChange} />
				{this.renderForm()}
				{this.renderReferenceRow(refProps)}
				{this.renderPageEntryRow()}
				{this.renderReferenceRow(refProps)}
			</div>
		);
	}

	private renderReferenceRow(props: any) {
		if (!props) return false;
		return (
			<div className="page-entry">
				<P1Standard {...props} />
			</div>
		);
	}

	private renderForm() {
		return (
			<form>
				{this.renderPageEntryFormGroup()}
				{this.renderMetadataFormGroup()}
				{this.renderLayoutFormGroup()}
			</form>
		);
	}

	private renderPageEntryFormGroup() {
		const { template } = this.state;
		return (
			<CollapsibleFieldSet label="Page Entry">
				<strong>Template:</strong>
				<div>
					<input
						id="template1"
						type="radio"
						name="template"
						value={X2TemplateKey}
						checked={template === X2TemplateKey}
						onChange={this.onChange}
					/>
					<label htmlFor="template1" className="label-inline">
						X2 Web View
					</label>
					<input
						id="template2"
						type="radio"
						name="template"
						value={X3TemplateKey}
						checked={template === X3TemplateKey}
						onChange={this.onChange}
					/>
					<label htmlFor="template2" className="label-inline">
						X3 Fullscreen Web View
					</label>
				</div>
			</CollapsibleFieldSet>
		);
	}

	private renderMetadataFormGroup() {
		const { link, title, tagline } = this.state;
		return (
			<CollapsibleFieldSet label="Metadata">
				<strong>Title:</strong>
				<div className="fw-input">
					<input
						name="title"
						type="text"
						value={title}
						placeholder="Enter Title"
						className="default-input"
						onChange={this.onChange}
					/>
				</div>
				<br />
				<strong>Tagline (optional):</strong>
				<div className="fw-input">
					<input
						name="tagline"
						type="text"
						value={tagline}
						placeholder="Enter Tagline"
						className="default-input"
						onChange={this.onChange}
					/>
				</div>
				<br />
				<strong>Destination URL:</strong>
				<div className="fw-input">
					<input
						name="link"
						type="text"
						value={link}
						placeholder="Destination URL"
						className="default-input"
						onChange={this.onChange}
					/>
				</div>
			</CollapsibleFieldSet>
		);
	}

	private renderLayoutFormGroup() {
		const {
			template,
			imageWidth,
			widthPercentage,
			imageHorizontalAlignment,
			imageVerticalSpacing,
			showReferenceRows,
			hideTitles,
			aspectRatio,
			pixelHeight
		} = this.state;
		return (
			<CollapsibleFieldSet label="Layout">
				<strong>Width:</strong>
				<div>
					<input
						id="imgPos1"
						type="radio"
						name="imageWidth"
						value="fullWidth"
						checked={imageWidth === 'fullWidth'}
						onChange={this.onChange}
					/>
					<label htmlFor="imgPos1" className="label-inline">
						Fill Viewport
					</label>
					<input
						id="imgPos2"
						type="radio"
						name="imageWidth"
						value="contentWidth"
						checked={imageWidth === 'contentWidth'}
						onChange={this.onChange}
					/>
					<label htmlFor="imgPos2" className="label-inline">
						Fill Content Grid
					</label>
					<input
						id="imgPos3"
						type="radio"
						name="imageWidth"
						value="widthPercentage"
						checked={imageWidth === 'widthPercentage'}
						onChange={this.onChange}
					/>
					<label htmlFor="imgPos3" className="label-inline">
						Percentage
					</label>
				</div>
				{imageWidth === 'widthPercentage' ? (
					<span>
						<br />
						<strong>Percentage:</strong>
						<input
							name="widthPercentage"
							type="text"
							className="default-input"
							pattern="[0-9]"
							value={widthPercentage}
							placeholder="%"
							onChange={this.onChange}
						/>
						<br />
						<strong>Horizontal Alignment:</strong>
						<div>
							<input
								id="ihAlign1"
								type="radio"
								name="imageHorizontalAlignment"
								value="left"
								checked={imageHorizontalAlignment === 'left'}
								onChange={this.onChange}
							/>
							<label htmlFor="ihAlign1" className="label-inline">
								Left
							</label>
							<input
								id="ihAlign2"
								type="radio"
								name="imageHorizontalAlignment"
								value="center"
								checked={imageHorizontalAlignment === 'center'}
								onChange={this.onChange}
							/>
							<label htmlFor="ihAlign2" className="label-inline">
								Center
							</label>
							<input
								id="ihAlign3"
								type="radio"
								name="imageHorizontalAlignment"
								value="right"
								checked={imageHorizontalAlignment === 'right'}
								onChange={this.onChange}
							/>
							<label htmlFor="ihAlign3" className="label-inline">
								Right
							</label>
						</div>
					</span>
				) : (
					false
				)}
				{template === X2TemplateKey ? (
					<div>
						<br />
						<strong>Height / Aspect Ratio:</strong>
						<div className="horz">
							<select name="aspectRatio" value={aspectRatio} onChange={this.onChange}>
								<option value="16x9">16:9</option>
								<option value="3x1">3:1</option>
								<option value="2x1">2:1</option>
								<option value="1x1">1:1</option>
								<option value="7x1">7:1</option>
								<option value="pixels">Fixed Height (in pixels)</option>
							</select>
							{aspectRatio === 'pixels' ? (
								<input type="text" name="pixelHeight" value={pixelHeight} onChange={this.onChange} />
							) : (
								false
							)}
						</div>
						<br />
						<strong>Adjacent Content:</strong>
						<br />
						<label className="form-group">
							<input
								type="checkbox"
								name="showReferenceRows"
								value={showReferenceRows}
								checked={showReferenceRows}
								disabled={imageVerticalSpacing !== 'default'}
								onChange={this.onChkChange}
							/>
							Show Reference Rows
						</label>
						<br />
						<label className="form-group">
							<input
								type="checkbox"
								name="hideTitles"
								value={hideTitles}
								checked={hideTitles}
								onChange={this.onChkChange}
							/>
							Hide Row Titles
						</label>
						<br />
						<br />
						<strong>Vertical Spacing:</strong>
						<select name="imageVerticalSpacing" value={imageVerticalSpacing} onChange={this.onChange}>
							<option value="default">Default</option>
							<option value="ignoreTop">Ignore Top</option>
							<option value="ignoreBottom">Ignore Bottom</option>
							<option value="ignoreBoth">Ignore Both</option>
						</select>
					</div>
				) : (
					false
				)}
				{template === X3TemplateKey && [
					<br key="br" />,
					<CollapsibleFieldSet label="Height" key="height">
						<div>
							<p>
								By default, the embedded website will fill the remaining content area height proportionate to the
								viewport height (the space below the header bar and above the footer, with the footer always remaining
								"below the fold").
								<br />
								If the embedded content exceeds the content height then a scrollbar will be presented within the
								embedded content area.
							</p>
							<p>
								Alternatively, to avoid undesirable scrollbars if the embedded website is suitably tailored it can
								announce its content height to the application to allow it to{' '}
								<strong>
									<em>resize to fit</em>
								</strong>
								.
							</p>
						</div>
						<TitledComponent title="Resize to Fit Height Instructions">
							<p>
								To tailor the website the Presentation Manager operator needs to own and host the embedded page.
								<br />
								This provided example code will announce its content height upon the initial load and also whenever the
								viewport resizes.
							</p>
							<span>
								It is the responsibility of the embedded website to ensure it calls the{' '}
								<span className="pre">postHeight</span> method whenever appropriate. e.g.
							</span>
							<ul>
								<li>
									If the content height adapts based on user interaction (
									<em>e.g. show/hide toggles such as an accordion</em>)
								</li>
								<li>
									If the content height adapts based on deferred loading of assets (
									<em>e.g. lazy loading or pagination</em>)
								</li>
								<li>
									If the content height adapts based on orientation changes (<em>landscape/horizontal</em>).
								</li>
							</ul>
							<pre>
								<span>{EMBED_CODE_SNIPPET}</span>
							</pre>
							<p>
								<em>The default X3 url used on this page has been tailored with the above code.</em>
							</p>
						</TitledComponent>
					</CollapsibleFieldSet>
				]}
			</CollapsibleFieldSet>
		);
	}

	private renderPageEntryRow() {
		const {
			template,
			hideTitles,
			imageWidth,
			imageHorizontalAlignment,
			widthPercentage,
			imageVerticalSpacing,
			pixelHeight,
			aspectRatio,
			link,
			title,
			tagline: customTagline
		} = this.state;
		const props = Object.assign({}, mock, {
			template,
			customFields: {
				imageWidth,
				imageHorizontalAlignment,
				imageVerticalSpacing,
				link,
				widthPercentage,
				title,
				customTagline,
				pixelHeight,
				aspectRatio
			}
		});
		return (
			<div className={cx(hideTitles ? 'row-title-hidden' : '', 'page-entry')}>
				{template === X2TemplateKey ? this.renderX2(props, title) : this.renderX3(props, title)}
			</div>
		);
	}

	private renderX2(props, title) {
		return <X2WebView {...props} title={title} />;
	}

	private renderX3(props, title) {
		const pageProps: any = {
			entries: [props],
			renderEntry: function(entry, index, customProps) {
				return <X3WebViewFullscreen {...props} {...customProps} title={title} key="x3" />;
			}
		};
		// Note this is a non connected version of WebView.
		return <WebView {...pageProps as PageProps} />;
	}
}
