import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { getPage } from 'shared/service/app';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { XUS1 as XUS1Tempate, XOS1 as XOS1Tempate } from 'shared/page/pageEntryTemplate';
import Dialog from 'ref/responsive/component/dialog/Dialog';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { XUS1 } from 'toggle/responsive/pageEntry/custom/XUS1';
import { XOS1 } from 'toggle/responsive/pageEntry/custom/XOS1';
import BrandLogo from 'ref/responsive/component/AxisLogo';
import { noop } from 'shared/util/function';

import './CarouselModal.scss';

const bem = new Bem('carousel-modal');

export interface OwnProps {
	onClose?: () => void;
	onSignin: () => void;
	onDisable: () => void;
	closeLabel?: string;
	signinLabel?: string;
	doNotShowLabel?: string;
	fullWidth?: boolean;
}

export interface StateProps {
	config: state.Config;
	pageKey: string;
}

interface CarouselModalState {
	page?: api.Page;
}

export class CarouselModal extends React.PureComponent<OwnProps & StateProps, CarouselModalState> {
	static defaultProps = {
		onClose: noop,
		closeLabel: '@{carousel_modal_no_thanks|No Thanks}',
		signinLabel: '@{carousel_modal_sign_in|Create An Account or Sign In}',
		doNotShowLabel: '@{carousel_modal_do_not_show_again|Don’t show me this message again}',
		fullWidth: false
	};

	state = {
		page: undefined
	};

	componentDidMount(): void {
		const { config, pageKey } = this.props;
		getPage(getPathByKey(pageKey, config), { textEntryFormat: 'html' }).then(result => {
			this.setState({ page: result.data });
		});
	}

	onDisable = () => {
		this.props.onDisable();
		this.props.onClose();
	};

	render() {
		const { onClose, onSignin, closeLabel, signinLabel, doNotShowLabel, fullWidth } = this.props;

		return (
			<Dialog className={bem.b({ fill: fullWidth })} hideCloseIcon={true}>
				<div className={bem.e('brand-logo')}>
					<BrandLogo fillColor="#FFFFFF" />
				</div>
				<div className={bem.e('entries')}>{this.renderEntries()}</div>
				<div className={bem.e('buttons-wrapper')}>
					<CtaButton onClick={onSignin} ordinal="primary" className={bem.e('cta-button')}>
						<IntlFormatter>{signinLabel}</IntlFormatter>
					</CtaButton>
					<CtaButton
						onClick={onClose}
						ordinal="secondary"
						theme="blue"
						className={bem.e('cta-button', { padded: true })}
					>
						<IntlFormatter>{closeLabel}</IntlFormatter>
					</CtaButton>
				</div>
				<div className={bem.e('buttons-wrapper')}>
					<CtaButton onClick={this.onDisable} ordinal="naked" className={bem.e('deny-button')}>
						<IntlFormatter>{doNotShowLabel}</IntlFormatter>
					</CtaButton>
				</div>
			</Dialog>
		);
	}

	renderEntries() {
		const { page } = this.state;
		if (!page) return;
		return (page.entries || []).map(this.renderEntry);
	}

	private renderEntry(entry: api.PageEntry) {
		if (entry.template === XUS1Tempate) {
			return <XUS1 key={entry.id} {...entry} />;
		}

		if (entry.template === XOS1Tempate) {
			return <XOS1 key={entry.id} {...entry} />;
		}
	}
}
