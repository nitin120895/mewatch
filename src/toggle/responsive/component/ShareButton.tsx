import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import ShareIcon from './icons/ShareIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Overlay from 'ref/responsive/component/Overlay';

import './ShareButton.scss';

interface Props {
	item: api.ItemDetail;
}

interface State {
	open: boolean;
}

const bem = new Bem('share-button');

export default class ShareButton extends React.PureComponent<Props, State> {
	state = {
		open: false
	};

	render() {
		const { open } = this.state;
		return (
			<div className={bem.b()} onClick={this.toggleMenu}>
				{open ? this.renderMenu() : <div />}
				<button type="button" className={open ? bem.e('button-arrow') : bem.e('button')}>
					<ShareIcon className={bem.e('icon')} />
					<IntlFormatter className={cx(bem.e('label'))}>{'@{share_label| Share}'}</IntlFormatter>
				</button>
			</div>
		);
	}

	private renderMenu() {
		const { open } = this.state;

		if (open) {
			return <Overlay onDismiss={this.onDismissRatingOverlay} />;
		}
	}

	private toggleMenu = () => {
		this.setState({ open: !this.state.open });
	};

	private onDismissRatingOverlay = () => {};
}
