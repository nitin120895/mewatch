import { configPage } from 'shared/';
import { ListDetailFeatured as template } from 'shared/page/pageTemplate';
import H1Standard from '../../pageEntry/hero/h1/H1Standard';
import H2Peeking from '../../pageEntry/hero/h2/H2Peeking';
import H9Image from '../../pageEntry/hero/h9/H9Image';
import H10Text from '../../pageEntry/hero/h10/H10Text';
import H11PageTitle from '../../pageEntry/hero/h11/H11PageTitle';
import Cs1ContinuousPoster from '../../pageEntry/continuous/Cs1ContinuousPoster';
import Cs2ContinuousTile from '../../pageEntry/continuous/Cs2ContinuousTile';
import Cs3ContinuousBlock from '../../pageEntry/continuous/Cs3ContinuousBlock';
import Cs4ContinuousSquare from '../../pageEntry/continuous/Cs4ContinuousSquare';
import P1Standard from '../../pageEntry/poster/P1Standard';
import T1Standard from '../../pageEntry/tile/T1Standard';
import B1Standard from '../../pageEntry/block/B1Standard';
import S1Standard from '../../pageEntry/square/S1Standard';
import Tl1Standard from '../../pageEntry/tall/Tl1Standard';
import Ed1Image from '../../pageEntry/editorial/Ed1Image';
import Ed2Text from '../../pageEntry/editorial/Ed2Text';
import Tx1Links from '../../pageEntry/text/Tx1Links';
import ListPage from './ListPage';

export const listDetailFeaturedEntries = [
	H1Standard,
	H2Peeking,
	H9Image,
	H10Text,
	H11PageTitle,
	Cs1ContinuousPoster,
	Cs2ContinuousTile,
	Cs3ContinuousBlock,
	Cs4ContinuousSquare,
	P1Standard,
	T1Standard,
	B1Standard,
	S1Standard,
	Tl1Standard,
	Ed1Image,
	Ed2Text,
	Tx1Links
];

export default configPage(ListPage, {
	template,
	entryRenderers: listDetailFeaturedEntries
});
