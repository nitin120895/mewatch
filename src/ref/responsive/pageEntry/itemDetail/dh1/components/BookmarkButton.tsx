import * as React from 'react';
import CtaToggleButton from 'ref/responsive/component/CtaToggleButton';
import * as cx from 'classnames';

interface BookmarkButtonProps {
	className?: string;
	bookmarked?: boolean;
	onClick?: () => void;
}

const BOOKMARK_SVG_DATA = 'm12,0v24m-12,-12h24';
const BOOKMARKED_SVG_DATA = 'm12,12m-11,0a11,11 0 1,0 22,0a11,11 0 1,0 -22,0zm6,0l4,4l6,-8';
const REMOVE_SVG_DATA = 'm5,5l14,14m-14,0l14,-14';

export default ({ className, bookmarked, onClick }: BookmarkButtonProps) => (
	<CtaToggleButton
		className={cx('bookmark-btn', className, { active: bookmarked })}
		labelId={'@{itemDetail_action_bookmark_default|Bookmark}'}
		labelIdActive={'@{itemDetail_action_bookmarked_default|Bookmarked}'}
		labelIdHovered={'@{itemDetail_action_bookmark_hovered|Bookmark}'}
		labelIdActiveHovered={'@{itemDetail_action_bookmarked_hovered|Remove}'}
		svgData={bookmarked ? BOOKMARKED_SVG_DATA : BOOKMARK_SVG_DATA}
		svgDataHovered={bookmarked ? REMOVE_SVG_DATA : BOOKMARK_SVG_DATA}
		onClick={onClick}
	/>
);
