import { configPage } from 'shared/';
import { ListDetailFeatured as template } from 'shared/page/pageTemplate';
import Lfh1Standard from 'ref/responsive/pageEntry/lists/Lfh1Standard';
import H9Image from 'ref/responsive/pageEntry/hero/h9/H9Image';
import H10Text from 'ref/responsive/pageEntry/hero/h10/H10Text';
import H11PageTitle from 'ref/responsive/pageEntry/hero/h11/H11PageTitle';
import Cs1ContinuousPoster from 'ref/responsive/pageEntry/continuous/Cs1ContinuousPoster';
import Cs2ContinuousTile from 'toggle/responsive/pageEntry/continuous/Cs2ContinuousTile';
import Cs3ContinuousBlock from 'ref/responsive/pageEntry/continuous/Cs3ContinuousBlock';
import Cs4ContinuousSquare from 'ref/responsive/pageEntry/continuous/Cs4ContinuousSquare';
import Ed1Image from 'ref/responsive/pageEntry/editorial/Ed1Image';
import Ed2Text from 'ref/responsive/pageEntry/editorial/Ed2Text';
import Ed5Button from 'ref/responsive/pageEntry/editorial/Ed5Button';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import T1Standard from 'toggle/responsive/pageEntry/tile/T1Standard';
import B1Standard from 'ref/responsive/pageEntry/block/B1Standard';
import S1Standard from 'ref/responsive/pageEntry/square/S1Standard';
import Tl1Standard from 'ref/responsive/pageEntry/tall/Tl1Standard';
import Xh1WebView from 'ref/responsive/pageEntry/custom/Xh1WebView';
import X2WebView from 'ref/responsive/pageEntry/custom/X2WebView';
import Tx1Links from 'ref/responsive/pageEntry/text/Tx1Links';
import XAD1Advertising from 'toggle/responsive/pageEntry/advertising/XAD1Advertising';

import ListPage from 'ref/responsive/page/list/ListPage';
import H1Standard from 'ref/responsive/pageEntry/hero/h1/H1Standard';

export default configPage(ListPage, {
	template,
	entryRenderers: [
		Lfh1Standard,
		// Lh2Centered,
		H1Standard,
		H9Image,
		H10Text,
		H11PageTitle,
		Xh1WebView,
		Cs1ContinuousPoster,
		Cs2ContinuousTile,
		Cs3ContinuousBlock,
		Cs4ContinuousSquare,
		Ed1Image,
		Ed2Text,
		Ed5Button,
		P1Standard,
		T1Standard,
		B1Standard,
		S1Standard,
		Tl1Standard,
		X2WebView,
		Tx1Links,
		XAD1Advertising
	]
});
