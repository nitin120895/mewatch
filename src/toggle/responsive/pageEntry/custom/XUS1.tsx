import * as React from 'react';
import { XUS1 as template } from 'shared/page/pageEntryTemplate';
import { convertResourceToSrcSet, resolveImages, fallbackURI } from 'shared/util/images';
import Image from 'shared/component/Image';
import { Bem } from 'shared/util/styles';
import Scrollable from 'ref/responsive/component/Scrollable';
import './XUS1.scss';

const bem = new Bem('xus1');
const imageWidth = 550;
const imageHeight = 310;

export function XUS1(props: api.PageEntry) {
	const items = props.list.items;
	return (
		<Scrollable className={bem.b()} length={items.length} showPaginationBullets={items.length > 1}>
			{items.map(renderItem)}
		</Scrollable>
	);
}
XUS1.template = template;

function renderItem(item: api.ItemSummary) {
	const { id, images, shortDescription, title } = item;
	const itemImages = resolveImages(images, 'tile', { width: imageWidth, height: imageHeight });
	const sources = itemImages.map(source => convertResourceToSrcSet(source));
	const isEmptyImage = sources[0].url === fallbackURI;

	return (
		<figure key={id} className={bem.e('item', { 'no-image': isEmptyImage })}>
			{!isEmptyImage && <Image srcSet={sources} width={imageWidth} height={imageHeight} className={bem.e('image')} />}
			<figcaption className={bem.e('caption')}>
				<h4 className={bem.e('title')}>{title}</h4>
				{shortDescription && renderList(shortDescription)}
			</figcaption>
		</figure>
	);
}

function renderList(text: string) {
	const bullets = text.split('\n').filter(val => !!val);
	return (
		<ul className={bem.e('list')}>
			{bullets.map(bullet => (
				<li key={bullet} className={bem.e('list-item')}>
					{bullet}
				</li>
			))}
		</ul>
	);
}
