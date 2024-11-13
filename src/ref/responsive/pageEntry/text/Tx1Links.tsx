import * as React from 'react';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';
import Scrollable from 'ref/responsive/component/Scrollable';
import CustomColorsButton from 'ref/responsive/component/CustomColorsButton';
import EntryTitle from 'ref/responsive/component/EntryTitle';

import './Tx1Links.scss';

interface CustomFields {
	textColor?: customFields.Color;
	backgroundColor?: customFields.Color;
}

interface Tx1LinksProps extends TPageEntryListProps<CustomFields> {}

const bem = new Bem('tx1');

export default class Tx1Links extends React.Component<Tx1LinksProps, any> {
	private scroller: Scrollable;

	componentDidMount() {
		this.restoreScrollPosition();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.list !== this.props.list) {
			this.restoreScrollPosition();
		}
	}

	private restoreScrollPosition() {
		const { savedState, list } = this.props;
		if (this.scroller && savedState && list && list.size > 0) {
			this.scroller.restoreScrollPosition(savedState.scrollX || 0);
		}
	}

	private onScroll = (scrollX: number, useTransition: boolean) => {
		const { savedState } = this.props;
		if (savedState) savedState.scrollX = scrollX;
	};

	private onScrollerRef = ref => (this.scroller = ref);

	render() {
		const { list } = this.props;
		if (!list) return false;
		return (
			<div className={bem.b()}>
				<EntryTitle {...this.props} />
				<Scrollable className="row-peek" length={list.items.length} onScroll={this.onScroll} ref={this.onScrollerRef}>
					{this.renderButtons()}
				</Scrollable>
			</div>
		);
	}

	private renderButtons() {
		const { id, customFields, list } = this.props;
		const { textColor, backgroundColor } = customFields;
		return list.items.map(button => (
			<Link key={`tx1-${id}-item-${button.id}`} className={bem.e('link')} to={button.path}>
				<CustomColorsButton
					className={bem.e('btn')}
					textColor={textColor}
					backgroundColor={backgroundColor}
					ordinal="secondary"
					large
				>
					{button.title}
				</CustomColorsButton>
			</Link>
		));
	}
}
