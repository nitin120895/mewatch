import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
const shopgif = require('../../../../resource/toggle/image/shoppingicon.gif');

import './ShopButton.scss';

interface Props {
	className?: string;
	width?: string;
	height?: string;
	shopUrl?: string;
}

interface State {}

const bem = new Bem('shop-button');

export default class ShopButton extends React.PureComponent<Props, State> {
	render() {
		const { shopUrl } = this.props;
		return (
			<div className={bem.b()}>
				<div>
					<a href={shopUrl} target="_blank" className={bem.e('gif-image')}>
						<img src={shopgif} alt="shoppping-gif" />{' '}
					</a>
				</div>
				<IntlFormatter className={cx(bem.e('label'))}>{'@{shop_label| Shop}'}</IntlFormatter>
			</div>
		);
	}
}
