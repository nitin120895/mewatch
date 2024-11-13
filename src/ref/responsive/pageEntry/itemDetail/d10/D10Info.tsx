import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { D10Info as template } from 'shared/page/pageEntryTemplate';
import Link from 'shared/component/Link';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import Packshot from 'ref/responsive/component/Packshot';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { columns as P1columns } from '../../poster/P1Standard';
import { columns as T1columns } from '../../tile/T1Standard';
import Image from 'shared/component/Image';
import { resolveImage } from 'shared/util/images';
import { resolveItemOrAncestor } from '../util/itemProps';
import { calculateMedianWidth, getColumnClasses } from '../../../util/grid';
import * as cx from 'classnames';
import { connect } from 'react-redux';

import './D10Info.scss';

interface D10InfoProps extends PageEntryItemDetailProps {
	classification?: api.Classification;
}

interface RowData {
	dataKey: string;
	labelKey: string;
}

// Property mappings
const rowsMovies: RowData[] = [
	{ dataKey: 'releaseYear', labelKey: '@{itemDetail_meta_released_label|Released}' },
	{ dataKey: 'duration', labelKey: '@{itemDetail_meta_duration_label|Duration}' },
	{ dataKey: 'genres', labelKey: '@{itemDetail_meta_genres_label|Genres}' },
	{ dataKey: 'hasClosedCaptions', labelKey: '@{itemDetail_meta_cc_label|Closed Captions}' }
];
const rowsTV: RowData[] = [
	{ dataKey: 'genres', labelKey: '@{itemDetail_meta_genres_label|Genres}' },
	{ dataKey: 'availableSeasonCount', labelKey: '@{itemDetail_meta_season_label|Seasons}' }
];

const posterWidth = calculateMedianWidth(P1columns);
const tileWidth = calculateMedianWidth(T1columns);

const bemWrapper = new Bem('d10');
const bemMeta = new Bem('d10-table');
const bemRating = new Bem('d10-rating');

class D10Info extends React.Component<D10InfoProps, any> {
	private mapClassificationImage(classification, code) {
		if (!code) return false;
		let classificationDetail = {};
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

	render() {
		const item = resolveItemOrAncestor(this.props);
		if (!item) return false;

		const rows = item.type === 'show' ? rowsTV : rowsMovies;
		const classificationCode = typeof item.classification !== 'undefined' ? item.classification.code : 'undefined';
		const classificationDetail = this.mapClassificationImage(this.props.classification, classificationCode);
		const customMeta = item.customMetadata || [];

		return (
			<div className="d10">
				<EntryTitle {...this.props} />
				<div>
					<div className={cx(bemWrapper.e('info'), 'row')}>
						{this.renderImage(item)}
						<table className={cx(bemMeta.b())}>
							<tbody>
								{rows
									.filter(row => item.hasOwnProperty(row.dataKey) && item[row.dataKey])
									.map((row, key) => this.renderRow(row.dataKey, item, row.labelKey, key))}
								{customMeta.map((meta, key) => this.renderCustomMetaData(meta.name, meta.value, key))}
							</tbody>
						</table>
						{this.renderClassification(classificationDetail, item.advisoryText)}
					</div>
					{this.renderCopyright(item.copyright)}
				</div>
			</div>
		);
	}

	private renderClassification(detail, advisoryText) {
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

	private renderCopyright(copyright: string) {
		if (!copyright) return false;
		return <div className={bemWrapper.e('copyright')}>{copyright}</div>;
	}

	private renderRow(dataKey: string, item: api.ItemDetail, labelId: string, key: number) {
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

	private renderRowValue(propKey: string, rowValue: any, item: api.ItemDetail) {
		switch (propKey) {
			case 'duration':
				return this.renderDuration(rowValue);
			case 'hasClosedCaptions':
				return this.renderClosedCaptioning(rowValue);
			case 'genres':
				return this.renderGenres(rowValue, item);
			default:
				return <td className={bemMeta.e('cell')}>{rowValue}</td>;
		}
	}

	private renderDuration(rowValue: number) {
		if (rowValue < 1) return false;
		const minutes = Math.round(rowValue / 60);
		return (
			<IntlFormatter elementType="td" className={bemMeta.e('cell', 'duration')} values={{ minutes }}>
				{'@{itemDetail_meta_duration_minute|"{minutes, number} {minutes, plural, one {min} other {mins}}"}'}
			</IntlFormatter>
		);
	}

	private renderClosedCaptioning(available: boolean) {
		if (!available) return false;
		return (
			<IntlFormatter elementType="td" className={bemMeta.e('cell')}>
				{'@{itemDetail_meta_cc_available|Available}'}
			</IntlFormatter>
		);
	}

	private renderCustomMetaData(key: string, value: string, index: number) {
		return (
			<tr key={`meta-${index}`}>
				<th className={bemMeta.e('header')}>{key}</th>
				<td className={bemMeta.e('cell')}>{value}</td>
			</tr>
		);
	}

	private removeDuplication(array: string[]) {
		if (!array) return undefined;
		return array.filter((elem, pos, arr) => {
			return arr.indexOf(elem) === pos;
		});
	}

	private renderGenres(genres: string[], item: api.ItemDetail) {
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
					<Link key={i === 0 ? genre : undefined} to={paths[i]} className={bemMeta.e('genre')}>
						{genre}
					</Link>
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

	private renderImage(item) {
		if (!item.images) return;

		const imageType = item.type === 'episode' || item.type === 'show' ? 'tile' : 'poster';
		const isTile = imageType === 'tile';

		return (
			<Packshot
				className={cx(getColumnClasses(isTile ? T1columns : P1columns))}
				item={item}
				imageType={imageType}
				imageOptions={{ width: isTile ? tileWidth : posterWidth }}
				titlePosition={'none'}
				tabEnabled={false}
			/>
		);
	}
}

function mapStateToProps(state: state.Root): any {
	return {
		classification: state.app.config.classification
	};
}

const Component: any = connect<any, any, D10InfoProps>(mapStateToProps)(D10Info);
Component.template = template;

export default Component;
