import { configPage } from 'shared/';
import { ListDetail as template } from 'shared/page/pageTemplate';
import H11PageTitle from '../../pageEntry/hero/h11/H11PageTitle';
import Lh1Standard from '../../pageEntry/lists/Lh1Standard';
import Cs5ContinuousAutomatic from '../../pageEntry/continuous/Cs5ContinuousAutomatic';
import Xh1WebView from '../../pageEntry/custom/Xh1WebView';
import X2WebView from '../../pageEntry/custom/X2WebView';
import ListPage from './ListPage';

export default configPage(ListPage, {
	template,
	entryRenderers: [H11PageTitle, Lh1Standard, Xh1WebView, X2WebView, Cs5ContinuousAutomatic]
});
