import Ah1Poster from '../../pageEntry/account/ah/Ah1Poster';
import Ah2Tile from '../../pageEntry/account/ah/Ah2Tile';
import Ah3Text from '../../pageEntry/account/ah/Ah3Text';
import A1Details from '../../pageEntry/account/a/A1Details';
// Due to changes in the API this needed to be renamed from a relative reference
// to an absolute one.
//
// This was done as part of the changes for MEDTOG2-1578 and should be left as
// is.
//
// Failing to do this will result in errors with the build.
//
// Ideally all imports here would be rewritten to use absolute paths rather than
// relative ones but for the sake of avoiding lots of merge conflicts in the
// future only the smallest number of changes has been made.
import A4Profiles from 'ref/tv/pageEntry/account/a/A4Profiles';
import A5ParentalLock from '../../pageEntry/account/a/A5ParentalLock';
import P1Standard from '../../pageEntry/poster/P1Standard';
import B1Standard from '../../pageEntry/block/B1Standard';
import S1Standard from '../../pageEntry/square/S1Standard';
import T1Standard from '../../pageEntry/tile/T1Standard';
import Tl1Standard from '../../pageEntry/tall/Tl1Standard';
import U1Poster from '../../pageEntry/user/U1Poster';
import U2Tile from '../../pageEntry/user/U2Tile';
import U3Block from '../../pageEntry/user/U3Block';
import U4Square from '../../pageEntry/user/U4Square';
import Ed1Image from '../../pageEntry/editorial/Ed1Image';
import Ed2Text from '../../pageEntry/editorial/Ed2Text';
import Tx1Links from '../../pageEntry/text/Tx1Links';
import Pr1Banner from '../../pageEntry/poster/Pr1Banner';

export default [
	Ah1Poster,
	Ah2Tile,
	Ah3Text,
	A1Details,
	A4Profiles,
	A5ParentalLock,
	P1Standard,
	B1Standard,
	S1Standard,
	T1Standard,
	Ed1Image,
	Ed2Text,
	Tl1Standard,
	U1Poster,
	U2Tile,
	U3Block,
	U4Square,
	Tx1Links,
	Pr1Banner
];
