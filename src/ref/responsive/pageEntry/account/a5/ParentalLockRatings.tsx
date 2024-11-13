import * as React from 'react';
import { Bem } from 'shared/util/styles';
import Spinner from 'ref/responsive/component/Spinner';
import TickIcon from 'ref/responsive/component/icons/TickIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { noop } from 'shared/util/function';
import ChevronIcon from 'ref/responsive/component/icons/ChevronIcon';

import './ParentalLockRatings.scss';

interface ParentalLockRatingsProps {
	onRatingChange?: (rating: string) => void;
	classifications: { [id: string]: api.Classification };
	rating: string;
	displayState?: 'pending' | 'success' | 'error';
}

const bem = new Bem('parental-lock-ratings');

export default class ParentalLockRatings extends React.Component<ParentalLockRatingsProps, any> {
	static defaultProps = {
		onRatingChange: noop
	};

	private onRatingDropdownChange = e => {
		this.props.onRatingChange(e.target.value);
	};

	render() {
		const { classifications, rating, displayState } = this.props;
		return (
			<div className={bem.b()}>
				<div className={bem.e('rating-select')}>
					<select
						id="min-rating-guard"
						className={bem.e('dropdown')}
						onChange={this.onRatingDropdownChange}
						value={rating}
						disabled={displayState === 'pending'}
					>
						{Object.values(classifications).map(classification => {
							return (
								<option key={classification.code} value={classification.code}>
									{classification.name}
								</option>
							);
						})}
					</select>
					<ChevronIcon className={bem.e('indicator')} />
				</div>
				{this.renderLoadingState()}
			</div>
		);
	}

	private renderLoadingState() {
		const { displayState } = this.props;
		return (
			<div className={bem.e('loading', displayState)}>
				<Spinner className={bem.e('loading-pending')} />
				<TickIcon className={bem.e('loading-success')} width={40} height={40} />
				{this.renderErrorTryAgain()}
			</div>
		);
	}

	private renderErrorTryAgain() {
		const { onRatingChange, rating } = this.props;
		return (
			<div className={bem.e('loading-error')}>
				<div className={bem.e('error-icon')}>!</div>
				<IntlFormatter
					elementType="button"
					className={bem.e('tryagain-btn')}
					onClick={() => onRatingChange(rating)}
					type="button"
				>
					{'@{account_common_try_again_label|Try Again}'}
				</IntlFormatter>
			</div>
		);
	}
}
