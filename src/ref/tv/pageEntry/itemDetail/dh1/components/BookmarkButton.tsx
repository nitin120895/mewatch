import * as React from 'react';
import SecondaryActionButton from './SecondaryActionButton';
import * as cx from 'classnames';

interface BookmarkButtonProps {
	className?: string;
	bookmarked?: boolean;
	index?: number;
	onClick?: () => void;
	onMouseEnter?: (index?: number) => void;
	onMouseLeave?: (index?: number) => void;
}

const BOOKMARK_ICON_DATA = 'icon-plus-icon';
const BOOKMARKED_ICON_DATA = 'icon-bookmarked';
const REMOVE_ICON_DATA = 'icon-close-button';

export default ({ className, bookmarked, index, onClick, onMouseEnter, onMouseLeave }: BookmarkButtonProps) => (
	<SecondaryActionButton
		className={cx('bookmark-btn', className)}
		iconClass={bookmarked ? BOOKMARKED_ICON_DATA : BOOKMARK_ICON_DATA}
		iconClassHovered={bookmarked ? REMOVE_ICON_DATA : BOOKMARK_ICON_DATA}
		index={index}
		onClick={onClick}
		onMouseEnter={onMouseEnter}
		onMouseLeave={onMouseLeave}
	/>
);
