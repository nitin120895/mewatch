import * as React from 'react';
import { Bem } from 'shared/util/styles';
import HeroCarousel from '../component/HeroCarousel';
import sass from 'ref/tv/util/sass';
import './H2Peeking.scss';

const bem = new Bem('h2-peeking');

export default class H2Peeking extends React.Component<PageEntryListProps, any> {
	render() {
		const { list } = this.props;
		const multiple = list && list.items && list.items.length > 1;
		return (
			<div className={bem.b({ multiple })}>
				<HeroCarousel
					imageType="hero3x1"
					itemWidth={sass.viewportWidth - sass.h2PeekSize * 2}
					rowHeight={multiple ? sass.h2Height : sass.h2LargeHeight}
					verticalSpacing={sass.h2PaddingTop}
					{...this.props}
				/>
			</div>
		);
	}
}
