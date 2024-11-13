import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { formatSecond } from 'shared/util/dates';
import { FormattedMessage } from 'react-intl';
import { D10Info as template } from 'shared/page/pageEntryTemplate';
import Link from 'shared/component/Link';
import Asset from 'ref/tv/component/Asset';
import EntryTitle from 'ref/tv/component/EntryTitle';
import IntlFormatter from 'ref/tv/component/IntlFormatter';
import Image from 'shared/component/Image';
import { resolveImage } from 'shared/util/images';
import { resolveItemOrAncestor } from '../util/itemProps';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { setPaddingStyle } from 'ref/tv/util/rows';
import sass from 'ref/tv/util/sass';

import './D10Info.scss';

interface D10InfoProps extends PageEntryItemDetailProps {
	classification?: api.Classification;
	itemImageTypes?: { [key: string]: string };
}

interface RowData {
	dataKey: string;
	labelKey: string;
}

// Property mappings
const rowsMovies: RowData[] = [
	{ dataKey: 'releaseYear', labelKey: 'itemDetail_meta_released_label' },
	{ dataKey: 'genres', labelKey: 'itemDetail_meta_genres_label' },
	{ dataKey: 'duration', labelKey: 'itemDetail_meta_duration_label' },
	{ dataKey: 'hasClosedCaptions', labelKey: 'itemDetail_meta_cc_label' }
];

const rowsTV: RowData[] = [
	{ dataKey: 'genres', labelKey: 'itemDetail_meta_genres_label' },
	{ dataKey: 'availableSeasonCount', labelKey: 'itemDetail_meta_season_label' }
];

const bemWrapper = new Bem('d10');
const bemMeta = new Bem('d10-table');
const bemRating = new Bem('d10-rating');
const focusable = true;

class D10Info extends React.Component<D10InfoProps, any> {
	static contextTypes: any = {
		router: React.PropTypes.object.isRequired,
		focusNav: React.PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLDivElement;

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			dynamicHeight: true,
			height: 1,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.setState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: skipMove
		};
	}

	componentDidMount() {
		let entryNode = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		if (focusable) {
			this.setState({ isFocused: isFocus });
			return true;
		}

		return false;
	};

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

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	render() {
		const item = resolveItemOrAncestor(this.props);
		if (!item) return false;

		const rows = item.type === 'show' ? rowsTV : rowsMovies;
		const classificationCode = typeof item.classification !== 'undefined' ? item.classification.code : 'undefined';
		const classificationDetail = this.mapClassificationImage(this.props.classification, classificationCode);
		const customMeta = item.customMetadata || [];

		return (
			<div
				className={bemWrapper.b({ focused: this.state.isFocused })}
				ref={ref => (this.ref = ref)}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				<EntryTitle {...this.props} />
				<div>
					<div className={bemWrapper.e('info')}>
						{this.renderImage(item)}
						<div className={bemWrapper.e('table-content')}>
							<table className={cx(bemMeta.b())}>
								<tbody>
									{rows
										.filter(row => item.hasOwnProperty(row.dataKey) && item[row.dataKey])
										.map((row, key) => this.renderRow(row.dataKey, item, row.labelKey, key))}
									{customMeta.map((meta, key) => this.renderCustomMetaData(meta.name, meta.value, key))}
								</tbody>
							</table>
							{this.renderClassification(classificationDetail, item.advisoryText)}
							{this.renderCopyright(item.copyright)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	private renderClassification(detail, advisoryText) {
		if (!detail.iconSrc) return false;

		const imageObj = { icon: detail.iconSrc };
		const image = resolveImage(imageObj, 'icon', { width: sass.d10InfoIconWidth, format: 'png' });

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
			<tr className={bemMeta.e('tr')} key={`row-${key}`}>
				<FormattedMessage id={labelId}>
					{(value: string) => <th className={bemMeta.e('header')}>{value}</th>}
				</FormattedMessage>
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
		const { hour, minute } = formatSecond(rowValue);
		let value = '';
		if (hour > 0)
			if (hour > 1) value += '@{itemDetail_meta_duration_hours}';
			else value += '@{itemDetail_meta_duration_hour}';
		if (minute > 0)
			if (minute > 1) value += (value ? ' ' : '') + '@{itemDetail_meta_duration_minutes}';
			else value += (value ? ' ' : '') + '@{itemDetail_meta_duration_minute}';

		return (
			<IntlFormatter tagName="td" className={bemMeta.e('cell')} values={{ hour, minute }}>
				{value}
			</IntlFormatter>
		);
	}

	private renderClosedCaptioning(available: boolean) {
		if (!available) return false;

		return (
			<IntlFormatter tagName="td" className={bemMeta.e('cell')}>{`@{itemDetail_meta_cc_available}`}</IntlFormatter>
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
		return array.filter((elem, pos, arr) => {
			return arr.indexOf(elem) === pos;
		});
	}

	private renderGenres(genres: string[], item: api.ItemDetail) {
		if (!genres) return false;

		genres = this.removeDuplication(genres).slice(0, 6);
		const paths: string[] = item.genrePaths || [];
		const jsx = [];
		let string = '';
		const hasPaths = paths.length === genres.length && focusable;

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

		let imageType: image.Type = this.props.itemImageTypes
			? (this.props.itemImageTypes[item.type] as image.Type)
			: undefined;
		if (!imageType) {
			imageType = item.type === 'episode' || item.type === 'show' ? 'tile' : 'poster';
		}

		return (
			<div className={bemWrapper.e('image')}>
				<Asset
					item={item}
					imageType={imageType}
					imageOptions={{ width: sass.posterImageWidth }}
					itemMargin={0}
					focused={false}
					hideItemBadge={true}
				/>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): any {
	return {
		classification: state.app.config.classification,
		itemImageTypes: state.app.config.general && state.app.config.general.itemImageTypes
	};
}

const Component: any = connect<any, any, D10InfoProps>(mapStateToProps)(D10Info);
Component.template = template;

export default Component;
