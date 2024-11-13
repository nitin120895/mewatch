import * as React from 'react';
import * as cx from 'classnames';
import Carousel from '../common/Carousel';
import { Bem } from 'shared/util/styles';

import './H6Peeking.scss';

const bem = new Bem('h6-hero');

const Component: any = (props: PageEntryListProps) => {
	const { list } = props;
	const hasOneItem = list.items.length < 2;
	return (
		<div className="full-bleed">
			<div className={cx(bem.b(), hasOneItem ? bem.e('one-item') : '')}>
				<Carousel {...props} mobileImageSize="tile" desktopImageSize="tile" isPeeking />
			</div>
		</div>
	);
};

Component.template = 'H6';
export default Component;
