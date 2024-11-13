import * as React from 'react';
import * as cx from 'classnames';
import { getColumnOffsetClasses } from 'ref/responsive/util/grid';
import { resolveImages } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import PackshotList from 'ref/responsive/component/PackshotList';
import Wallpaper from 'ref/responsive/pageEntry/branded/Wallpaper';
import { getListThemeColor } from 'ref/responsive/pageEntry/util/custom';

import 'ref/responsive/pageEntry/branded/BrandedBackground.scss';

const bem = new Bem('branded-bg');

interface BrandedEntryProps extends PageEntryListProps {
	imageType: image.Type;
	doubleRow?: boolean;
	columns?: grid.BreakpointColumn[];
	offsets?: grid.BreakpointColumn[];
}

interface BrandedBackgroundState {
	wallpaper: image.Resource;
	scrollLeft?: number;
	useTransition?: boolean;
	backgroundColor?: string;
}

export default class BrandedBackground extends React.Component<BrandedEntryProps, BrandedBackgroundState> {
	private background: HTMLElement;

	constructor(props) {
		super(props);
		this.state = this.getState(props ? props.list : undefined);
	}

	componentDidMount() {
		this.updateBackgroundColor(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.list !== this.props.list) {
			const state = this.getState(nextProps.list);
			this.setState(state);
			this.updateBackgroundColor(nextProps);
		}
	}

	private getState(list: api.ItemList) {
		if (!list || !list.images) {
			return {
				wallpaper: undefined
			};
		}
		return {
			wallpaper: list.images.tile ? resolveImages(list.images, 'tile', { width: 720 })[0] : undefined
		};
	}

	private updateBackgroundColor({ list }) {
		const backgroundColor = getListThemeColor('Background', 'Primary', list);
		this.setState({ backgroundColor });
		this.background.style.backgroundColor = backgroundColor;
	}

	private onScroll = (scrollLeft, useTransition) => {
		this.setState({ scrollLeft, useTransition });
	};

	private onBackgroundReference = node => (this.background = node);

	render() {
		const {
			list,
			savedState,
			className,
			imageType,
			doubleRow,
			columns,
			offsets,
			customFields,
			template,
			loadNextListPage
		} = this.props;
		const { wallpaper, scrollLeft, useTransition, backgroundColor } = this.state;

		return (
			<section className={cx(className, bem.b())}>
				<EntryTitle {...this.props} />
				<div
					className={cx(bem.e('container'), 'full-bleed', { 'no-wallpaper': !wallpaper })}
					ref={this.onBackgroundReference}
				>
					<Wallpaper
						id={`wallpaper-gradient-${list.id}-${template}`}
						img={wallpaper}
						scrollLeft={scrollLeft}
						useTransition={useTransition}
						gradientColor={backgroundColor}
					/>
					<div className={cx('col-mobile-24', bem.e('packshot-wrapper'))}>
						<PackshotList
							list={list}
							packshotTitlePosition={customFields.assetTitlePosition}
							firstPackshotClassName={wallpaper ? cx(...getColumnOffsetClasses(offsets)) : ''}
							imageType={imageType}
							doubleRow={doubleRow}
							savedState={savedState}
							onScroll={this.onScroll}
							columns={columns}
							template={template}
							loadNextListPage={loadNextListPage}
						/>
					</div>
				</div>
			</section>
		);
	}
}
