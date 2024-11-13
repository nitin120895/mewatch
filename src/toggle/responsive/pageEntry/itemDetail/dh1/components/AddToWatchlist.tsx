import * as React from 'react';
import CtaToggleButton from 'ref/responsive/component/CtaToggleButton';

export interface WatchlistButtonProps {
	className?: string;
	addedToWatchlist?: boolean;
	onClick?: () => void;
}

const WATCHLIST_ITEM_SVG_DATA = 'M10.778.778v22M0 12h22';
const ADDED_TO_WATCHLIST_SVG_DATA = 'm12,12m-11,0a11,11 0 1,0 22,0a11,11 0 1,0 -22,0zm6,0l4,4l6,-8';
const REMOVE_SVG_DATA = 'm5,5l14,14m-14,0l14,-14';

export default ({ className, addedToWatchlist, onClick }: WatchlistButtonProps) => (
	<CtaToggleButton
		className={className}
		labelId={'@{itemDetail_action_watchlist|My List}'}
		labelIdHovered={'@{itemDetail_action_watchlist|My List}'}
		svgData={addedToWatchlist ? ADDED_TO_WATCHLIST_SVG_DATA : WATCHLIST_ITEM_SVG_DATA}
		svgDataHovered={addedToWatchlist ? REMOVE_SVG_DATA : WATCHLIST_ITEM_SVG_DATA}
		onClick={onClick}
	/>
);
