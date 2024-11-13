import { configPage } from 'shared/';
import { ListDetailFeatured as template } from 'shared/page/pageTemplate';
import Lfh1Standard from '../../pageEntry/lists/Lfh1Standard';
import H9Image from '../../pageEntry/hero/h9/H9Image';
import H10Text from '../../pageEntry/hero/h10/H10Text';
import H11PageTitle from '../../pageEntry/hero/h11/H11PageTitle';
import Cs1ContinuousPoster from '../../pageEntry/continuous/Cs1ContinuousPoster';
import Cs2ContinuousTile from '../../pageEntry/continuous/Cs2ContinuousTile';
import Cs3ContinuousBlock from '../../pageEntry/continuous/Cs3ContinuousBlock';
import Cs4ContinuousSquare from '../../pageEntry/continuous/Cs4ContinuousSquare';
import Ed1Image from '../../pageEntry/editorial/Ed1Image';
import Ed2Text from '../../pageEntry/editorial/Ed2Text';
import Ed5Button from '../../pageEntry/editorial/Ed5Button';
import P1Standard from '../../pageEntry/poster/P1Standard';
import T1Standard from '../../pageEntry/tile/T1Standard';
import B1Standard from '../../pageEntry/block/B1Standard';
import S1Standard from '../../pageEntry/square/S1Standard';
import Tl1Standard from '../../pageEntry/tall/Tl1Standard';
import Xh1WebView from '../../pageEntry/custom/Xh1WebView';
import X2WebView from '../../pageEntry/custom/X2WebView';
import Tx1Links from '../../pageEntry/text/Tx1Links';

import ListPage from './ListPage';

export default configPage(ListPage, {
	template,
	entryRenderers: [
		Lfh1Standard,
		// Lh2Centered,
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
		Tx1Links
	]
});
