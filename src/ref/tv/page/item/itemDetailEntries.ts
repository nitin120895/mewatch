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
import Dh1Standard from 'ref/tv/pageEntry/itemDetail/dh1/Dh1Standard';
import Dh2Centered from 'ref/tv/pageEntry/itemDetail/dh2/Dh2Centered';
import D1EpisodeGrid from '../../pageEntry/itemDetail/d1/D1EpisodeGrid';
import D2EpisodeList from '../../pageEntry/itemDetail/d2/D2EpisodeList';
import D3EpisodeRow from '../../pageEntry/itemDetail/d3/D3EpisodeRow';
import D4Trailers from '../../pageEntry/itemDetail/d4/D4Trailers';
import D5RecommendationsTile from '../../pageEntry/itemDetail/d5/D5RecommendationsTile';
import D6RecommendationsPoster from '../../pageEntry/itemDetail/d6/D6RecommendationsPoster';
import D7RecommendationsSquare from '../../pageEntry/itemDetail/d7/D7RecommendationsSquare';
import D8CastCrew from '../../pageEntry/itemDetail/d8/D8CastCrew';
import D9CastCrewText from '../../pageEntry/itemDetail/d9/D9CastCrewText';
import D10Info from '../../pageEntry/itemDetail/d10/D10Info';

export default [
	Dh1Standard,
	Dh2Centered,
	D1EpisodeGrid,
	D2EpisodeList,
	D3EpisodeRow,
	D4Trailers,
	D5RecommendationsTile,
	D6RecommendationsPoster,
	D7RecommendationsSquare,
	D8CastCrew,
	D9CastCrewText,
	D10Info
];
