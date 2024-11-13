import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { D10Info as template } from 'shared/page/pageEntryTemplate';
import Link from 'shared/component/Link';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import Packshot from 'ref/responsive/component/Packshot';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { columns as P1columns } from 'ref/responsive/pageEntry/poster/P1Standard';
import { columns as T1columns } from 'ref/responsive/pageEntry/tile/T1Standard';
import Image from 'shared/component/Image';
import { resolveImage } from 'shared/util/images';
import { calculateMedianWidth, getColumnClasses } from '../../../util/grid';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { get } from 'shared/util/objects';
import { getItemFromCache } from 'shared/page/pageUtil';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes, TagType } from 'shared/analytics/types/types';

import './D10Info.scss';

interface OwnProps extends PageEntryItemDetailProps {}

interface StateProps {
	classification: api.AppConfig['classification'];
}

type Props = OwnProps & StateProps;

interface RowData {
	dataKey: string;
	labelKey: string;
}

// Property mappings
const rowsMovies: RowData[] = [
	{ dataKey: 'releaseYear', labelKey: '@{itemDetail_meta_released_label|Released}' },
	{ dataKey: 'genres', labelKey: '@{itemDetail_meta_genres_label|Genres}' },
	{ dataKey: 'duration', labelKey: '@{itemDetail_meta_duration_label|Duration}' }
];
const rowsTV: RowData[] = [
	{ dataKey: 'releaseYear', labelKey: '@{itemDetail_meta_released_label|Released}' },
	{ dataKey: 'genres', labelKey: '@{itemDetail_meta_genres_label|Genres}' },
	{ dataKey: 'seasonNumber', labelKey: '@{itemDetail_meta_season_label|Seasons}' }
];

const posterWidth = calculateMedianWidth(P1columns);
const tileWidth = calculateMedianWidth(T1columns);

const bemWrapper = new Bem('d10');
const bemMeta = new Bem('d10-table');
const bemRating = new Bem('d10-rating');

class D10Info extends React.Component<Props, {}> {
	private mapClassificationImage(classification, code) {
		if (!code) return false;
		let classificationDetail: any = {};
		for (let prop in classification) {
			if (prop === code) {
				classificationDetail = {
					iconSrc: classification[prop].images.icon,
					text: classification[prop].advisoryText
				};
			}
		}
		return classificationDetail;
	}

	isShow(): boolean {
		const { item, pageKey } = this.props;
		return item.type === 'show' || pageKey === 'ShowDetail';
	}

	render() {
		const { item } = this.props;
		if (!item) return false;

		const rows = item.type === 'movie' ? rowsMovies : rowsTV;

		const label = this.isShow()
			? '@{itemDetail_meta_broadcasted_label|Broadcasted}'
			: '@{itemDetail_meta_released_label|Released}';
		rowsTV.find(item => item.dataKey === 'releaseYear').labelKey = label;

		const classificationCode = typeof item.classification !== 'undefined' ? item.classification.code : 'undefined';
		const classificationDetail = this.mapClassificationImage(this.props.classification, classificationCode);
		const classificationExists = classificationDetail && classificationDetail.iconSrc;

		return (
			<div className="d10">
				<EntryTitle {...this.props} />
				<div>
					<div className={cx(bemWrapper.e('info'), 'row')}>
						{this.renderImage(item)}
						<table className={cx(bemMeta.b(), { classificationExists })}>
							<tbody>
								{rows
									.filter(row => item.hasOwnProperty(row.dataKey) && item[row.dataKey])
									.map((row, key) => this.renderRow(row.dataKey, item, row.labelKey, key))}
							</tbody>
						</table>
						{this.renderClassification(classificationDetail, item.advisoryText)}
					</div>
					{this.renderCopyright(item)}
				</div>
			</div>
		);
	}

	renderClassification(detail, advisoryText) {
		if (!detail.iconSrc) return false;
		const imageObj = { icon: detail.iconSrc };
		const image = resolveImage(imageObj, 'icon', { width: 64, format: 'png' });
		return (
			<div className={cx(bemRating.b())}>
				<Image src={image.src} className={cx(bemRating.e('image'))} />
				<span className={cx(bemRating.e('text'))}>{advisoryText || detail.text}</span>
			</div>
		);
	}

	renderCopyright(item: api.ItemDetail) {
		const updatedItem = this.isShow() ? getItemFromCache(item, this.props.itemDetailCache) : item;
		if (updatedItem && !updatedItem.copyright) return false;
		const copyright = get(updatedItem, `copyright`);
		return copyright && <div className={bemWrapper.e('copyright')}>{copyright}</div>;
	}

	renderRow(dataKey: string, item: api.ItemDetail, labelId: string, key: number) {
		const rowValue = item[dataKey];
		if (!rowValue) return false;
		const rowJsx = this.renderRowValue(dataKey, rowValue, item);
		if (!rowJsx) return false;
		return (
			<tr key={`row-${key}`}>
				<IntlFormatter elementType="th" className={bemMeta.e('header')}>
					{labelId}
				</IntlFormatter>
				{rowJsx}
			</tr>
		);
	}

	renderRowValue(propKey: string, rowValue: any, item: api.ItemDetail) {
		switch (propKey) {
			case 'duration':
				return this.renderDuration(rowValue);
			case 'genres':
				return this.renderGenres(rowValue, item);
			case 'seasonNumber':
				return this.renderSeasonCount(item);
			default:
				return <td className={bemMeta.e('cell')}>{rowValue}</td>;
		}
	}

	renderSeasonCount(item: api.ItemDetail) {
		const seasonCount = get(getItemFromCache(item, this.props.itemDetailCache), 'availableSeasonCount');
		if (!seasonCount) return undefined;
		return <td className={bemMeta.e('cell')}>{seasonCount}</td>;
	}

	renderDuration(rowValue: number) {
		if (rowValue < 1) return false;
		const time = Math.round(rowValue / 60);
		return (
			<IntlFormatter elementType="td" className={bemMeta.e('cell', 'duration')} values={{ time }}>
				{'@{itemDetail_meta_duration_minute|"{minutes, number} {minutes, plural, one {min} other {mins}}"}'}
			</IntlFormatter>
		);
	}

	removeDuplication(array: string[]) {
		if (!array) return undefined;
		return array.filter((elem, pos, arr) => {
			return arr.indexOf(elem) === pos;
		});
	}

	renderGenres(genres: string[], item: api.ItemDetail) {
		genres = this.removeDuplication(genres);
		if (!genres || !genres.length) {
			return false;
		}
		const paths: string[] = this.removeDuplication(item.genrePaths) || [];
		const jsx = [];
		let string = '';
		const hasPaths = paths.length === genres.length;

		for (let i = 0; i < genres.length; i++) {
			const genre = genres[i];
			const sep = i === 0 ? '' : ', ';
			if (hasPaths) {
				const link = (
					<CTAWrapper
						type={CTATypes.ProgramTag}
						data={{
							tagType: TagType.Genre,
							tagValue: genre,
							item: item
						}}
						key={i === 0 ? genre : undefined}
					>
						<Link key={i === 0 ? genre : undefined} to={paths[i]} className={bemMeta.e('genre')}>
							{genre}
						</Link>
					</CTAWrapper>
				);
				if (i === 0) {
					jsx.push(link);
				} else {
					jsx.push(
						<span key={genre}>
							<span>{sep}</span>
							{link}
						</span>
					);
				}
			} else {
				string += sep + genre;
			}
		}
		return <td className={bemMeta.e('cell')}>{jsx.length > 0 ? jsx : string}</td>;
	}

	renderImage(item: api.ItemDetail) {
		if (!item.images) return;

		const imageType = ['episode', 'show', 'season'].includes(item.type) ? 'tile' : 'poster';
		const isTile = imageType === 'tile';

		return (
			<Packshot
				className={cx(getColumnClasses(isTile ? T1columns : P1columns))}
				item={item}
				imageType={imageType}
				imageOptions={{ width: isTile ? tileWidth : posterWidth }}
				titlePosition={'none'}
				tabEnabled={false}
				showPartnerLogo
			/>
		);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	return {
		classification: state.app.config.classification
	};
}

const Component: any = connect<StateProps, void, OwnProps>(mapStateToProps)(D10Info as any);
Component.template = template;

export default Component;
