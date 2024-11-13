import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import { CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { Bem } from 'shared/util/styles';
import RadioButtonComponent from '../../component/input/RadioButtonComponent';
import CloseIcon from '../../component/modal/CloseIcon';
import WarningIcon from '../../component/icons/WarningIcon';
import BonusLink from './BonusLink';

import './ChoosePlanModal.scss';

const bem = new Bem('choose-plan-modal');

export interface ChoosePlanModalOwnProps {
	id?: string;
	title: string;
	pricePlans: api.PricePlan[];
	onProceed: (plan: api.PricePlan) => void;
	onCancel?: () => void;
	primaryAccount: boolean;
	signedIn: boolean;
	selectedPlan?: api.PricePlan;
}

interface ChoosePlanModalState {
	selected: api.PricePlan;
}

type ChoosePlanModalProps = ChoosePlanModalOwnProps & ModalManagerDispatchProps;

class ChoosePlanModal extends React.PureComponent<ChoosePlanModalProps, ChoosePlanModalState> {
	constructor(props) {
		super(props);
		this.state = {
			selected: props.selectedPlan || props.pricePlans[0]
		};
	}

	private onConfirm = () => {
		const { onProceed, closeModal, id } = this.props;
		onProceed(this.state.selected);
		closeModal(id);
	};

	private onCancel = () => {
		const { onCancel, closeModal, id } = this.props;
		if (onCancel) onCancel();
		closeModal(id);
	};

	private onClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event) event.stopPropagation();
	};

	render() {
		const { title, primaryAccount, signedIn, pricePlans } = this.props;
		const buttonName = signedIn
			? '@{subscription_choose_plan_modal_proceed}'
			: '@{subscription_choose_plan_modal_proceed_anonymous}';

		return (
			<div className="choose-plan-overlay" onClick={this.onCancel}>
				<div className={bem.b()} onClick={this.onClick}>
					<div className={bem.e('close')} onClick={this.onCancel}>
						<CloseIcon />
					</div>
					<div className={bem.e('container')}>
						<IntlFormatter className={cx(bem.e('container', 'title'))} elementType="div">
							{title}
						</IntlFormatter>
						<div className={bem.e('options')}>
							{pricePlans.map((pricePlan, key) => this.renderPricePlansOption(pricePlan, key))}
						</div>
						<div className={cx(bem.e('container', 'buttons'))}>
							{primaryAccount || !signedIn ? (
								<CtaButton ordinal="primary" className="confirm" onClick={this.onConfirm}>
									<IntlFormatter>{buttonName}</IntlFormatter>
								</CtaButton>
							) : (
								<div className={bem.e('warning')}>
									<WarningIcon className={bem.e('warning-icon')} />
									<IntlFormatter>{'@{subscription_choose_plan_modal_warning}'}</IntlFormatter>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	private renderPricePlansOption = (pricePlan, key) => {
		const { primaryAccount, signedIn } = this.props;
		const { priceText1, priceText2, priceText3, bonusText1, bonusText2, bonusText1Link, bonusText2Link } = pricePlan;
		const secondary = signedIn && !primaryAccount;

		return (
			<div className={bem.e('option', { secondary })} key={key}>
				<RadioButtonComponent
					key={pricePlan.id}
					checked={this.state.selected.id === pricePlan.id}
					name="pricePlan"
					value={pricePlan.id}
					onChange={() => this.onPricePlanChanged(pricePlan)}
				>
					<IntlFormatter className={bem.e('price-plan-input')}>{priceText1}</IntlFormatter>
					<IntlFormatter className={bem.e('contract')}>{priceText2}</IntlFormatter>
				</RadioButtonComponent>
				{priceText3 && <div className={bem.e('option', 'prepayment')}>{priceText3}</div>}
				{bonusText1 && <BonusLink url={bonusText1Link} label={bonusText1} />}
				{bonusText2 && <BonusLink url={bonusText2Link} label={bonusText2} />}
			</div>
		);
	};

	private onPricePlanChanged = plan => {
		this.setState({
			selected: plan
		});
	};
}

function mapDispatchToProps(dispatch) {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

export default connect<any, ModalManagerDispatchProps, ChoosePlanModalOwnProps>(
	undefined,
	mapDispatchToProps
)(ChoosePlanModal);
