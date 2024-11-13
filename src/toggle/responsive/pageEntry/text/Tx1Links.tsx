import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { get } from 'shared/util/objects';
import Link from 'shared/component/Link';
import CtaButton from 'toggle/responsive/component/CtaButton';
import EntryTitle from 'toggle/responsive/component/EntryTitle';

import './Tx1Links.scss';

interface Tx1LinksProps extends TPageEntryListProps<{}> {}

const bem = new Bem('tx1');

export default class Tx1Links extends React.Component<Tx1LinksProps> {
	render() {
		const { list } = this.props;

		if (!list) {
			// tslint:disable-next-line
			return null;
		}

		return (
			<div className={bem.b()}>
				<EntryTitle {...this.props} />
				<div className={bem.e('render-container')}>
					<div>{this.renderButtons()}</div>
				</div>
			</div>
		);
	}

	private renderButtons() {
		const { id, list } = this.props;
		const items = get(list, 'items');

		if (items) {
			return items.map(item => {
				const isImageExist = () => {
					const customSrc = get(item, 'images.custom');
					if (customSrc) {
						return <img src={customSrc} className={bem.e('picture')} />;
					}
					return;
				};

				return (
					<Link key={`tx1-${id}-item-${item.id}`} className={bem.e('link')} to={item.path}>
						<CtaButton className={bem.e('btn')} ordinal="secondary">
							<div className={bem.e('container')}>
								{isImageExist()}
								{item.title}
								<span className={bem.e('arrow-span')}>»</span>
							</div>
						</CtaButton>
					</Link>
				);
			});
		}
	}
}
