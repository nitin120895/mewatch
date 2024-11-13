import * as React from 'react';
import * as cx from 'classnames';
import MenuWrapper from 'shared/analytics/components/MenuWrapper';
import { wrapMenuEntry } from 'shared/analytics/components/PseudoEntryWrapper';
import { MenuTypes } from 'shared/analytics/types/types';
import { Bem } from 'shared/util/styles';
import Packshot from 'ref/responsive/component/Packshot';
import NavEntryLink from 'ref/responsive/app/nav/NavEntryLink';
import { getNavContentPackshotProps } from 'shared/app/navUtil';
import { canShowProgressForList, checkListData } from 'shared/list/listUtil';
import NavScrollableList from './NavScrollableList';

import './NavContent.scss';

interface NavContentProps extends React.Props<any> {
	className?: string;
	title?: string;
	parentMenuTitle: string;
	list: api.ItemList;
	imageType?: image.Type;
	vertical?: boolean;
	loadNextListPage?: (list: api.ItemList) => {};
}

const IMAGE_TYPE_LAYOUT = {
	poster: {
		cols: 4,
		rows: 2
	},
	tile: {
		cols: 3,
		rows: 2
	},
	hero3x1: {
		cols: 1,
		rows: 2
	}
};

const bem = new Bem('nav-content');

class NavContent extends React.Component<NavContentProps, any> {
	static defaultProps = {
		imageType: 'poster'
	};

	private allowProgressBar: boolean;

	componentDidMount() {
		this.updateLayout();
	}

	componentDidUpdate(prevProps: NavContentProps) {
		if (!prevProps.list && this.props.list) {
			this.updateLayout();
		}
	}

	private updateLayout() {
		// update parent's layout when list is defined
		window.dispatchEvent(new CustomEvent('resize', { bubbles: true, cancelable: false }));
	}

	render() {
		return (
			<div className={cx(bem.b(), this.props.className)}>
				{this.renderTitle()}
				{this.renderList()}
			</div>
		);
	}

	private renderTitle(): any {
		const { title, list, parentMenuTitle } = this.props;
		const label = title || list.title;
		if (!label) return;
		const entry: api.NavEntry = {
			label,
			path: list.path,
			depth: 1
		};
		return (
			<MenuWrapper type={MenuTypes.HoverDropdown} menuItemsOrder={[parentMenuTitle, label]}>
				<NavEntryLink className={bem.e('title')} entry={entry} />
			</MenuWrapper>
		);
	}

	private renderList(): any {
		const { list, imageType, vertical, loadNextListPage } = this.props;

		// show progress bar for bookmarks, watched and continue watching lists
		this.allowProgressBar = canShowProgressForList(list.id);
		// check show item for continue watching list
		checkListData(list);

		if (vertical) {
			const classes = bem.e('row', { scrollable: vertical });
			const packshotClasses = bem.e('packshot', imageType);
			return (
				<NavScrollableList
					className={classes}
					packshotClassName={packshotClasses}
					imageType={imageType}
					list={list}
					allowProgressBar={this.allowProgressBar}
					loadNextListPage={loadNextListPage}
				/>
			);
		}
		const { cols, rows } = IMAGE_TYPE_LAYOUT[imageType] || IMAGE_TYPE_LAYOUT.poster;
		const maxItems = cols * rows;
		const jsx = [];
		for (let i = 0; i < maxItems; i += cols) {
			const items = list.items.slice(i, i + cols);
			jsx.push(
				<div key={'row-' + jsx.length} className={bem.e('row')}>
					{items.map(this.renderPackshot)}
				</div>
			);
		}
		return jsx;
	}

	private renderPackshot = (item: api.ItemSummary): any => {
		const { list, imageType, parentMenuTitle } = this.props;
		const options = [parentMenuTitle, item.title];
		return (
			<MenuWrapper type={MenuTypes.HoverDropdown} menuItemsOrder={options} key={item.id}>
				<Packshot
					{...getNavContentPackshotProps(list, item, imageType)}
					className={bem.e('packshot', imageType)}
					tabEnabled
					allowProgressBar={this.allowProgressBar}
					hasHover={false}
					hasOverlay={false}
					hasPlayIcon={false}
					showPartnerLogo
				/>
			</MenuWrapper>
		);
	};
}

export default wrapMenuEntry(NavContent);
