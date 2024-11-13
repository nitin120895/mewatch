import * as React from 'react';
import { Bem } from 'shared/util/styles';
import HeroCarousel from '../component/HeroCarousel';
import sass from 'ref/tv/util/sass';

const bem = new Bem('h1-standard');

class H1Standard extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<div className={bem.b()}>
				<HeroCarousel
					imageType="hero3x1"
					rowHeight={sass.h1Height}
					verticalSpacing={0}
					showArrow={true}
					{...this.props}
				/>
			</div>
		);
	}
}

export default H1Standard;
