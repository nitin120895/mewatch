import * as React from 'react';
import { Bem } from 'shared/util/styles';
import HeroCarousel from '../component/HeroCarousel';
import sass from 'ref/tv/util/sass';
import './H6Peeking.scss';

const bem = new Bem('h6-peeking');

export default class H6Peeking extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<div className={bem.b()}>
				<HeroCarousel
					imageType="tile"
					itemWidth={sass.viewportWidth - sass.h6PeekSize * 2}
					rowHeight={sass.h6Height}
					verticalSpacing={sass.h6PaddingTop}
					{...this.props}
				/>
			</div>
		);
	}
}
