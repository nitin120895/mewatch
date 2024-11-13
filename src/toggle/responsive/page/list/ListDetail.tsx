import * as React from 'react';
import { configPage } from 'shared/';
import { ListDetail as template } from 'shared/page/pageTemplate';
import H11PageTitle from 'ref/responsive/pageEntry/hero/h11/H11PageTitle';
import Lh1Standard from 'ref/responsive/pageEntry/lists/Lh1Standard';
import Cs5ContinuousAutomatic from 'ref/responsive/pageEntry/continuous/Cs5ContinuousAutomatic';
import Xh1WebView from 'ref/responsive/pageEntry/custom/Xh1WebView';
import X2WebView from 'ref/responsive/pageEntry/custom/X2WebView';
import ListPage from 'ref/responsive/page/list/ListPage';
import XAD1Advertising from 'toggle/responsive/pageEntry/advertising/XAD1Advertising';
import PageNotFound from 'toggle/responsive/page/PageNotFound';

const mapStateToProps = ({ page }: state.Root) => ({
	pageNotFound: !page.loading && page.showPageNotFound
});

const WithNotFoundPage = WrappedComponent => props => {
	if (props.pageNotFound) {
		return <PageNotFound {...props} />;
	} else {
		return <WrappedComponent {...props} />;
	}
};

export default configPage(WithNotFoundPage(ListPage), {
	template,
	entryRenderers: [H11PageTitle, Lh1Standard, Xh1WebView, X2WebView, Cs5ContinuousAutomatic, XAD1Advertising],
	mapStateToProps
});
