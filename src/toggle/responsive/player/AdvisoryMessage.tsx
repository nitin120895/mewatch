import * as React from 'react';
import * as cx from 'classnames';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getDefaultAdvisoryMessage } from 'toggle/responsive/util/playerUtil';

import './AdvisoryMessage.scss';

const ADVISORY_TEXT_TIMER = 5000;
const MAX_ADVISORY_TEXT_COUNT = 3;
const MAX_ADVISORY_TEXT_LENGTH = 80;
const noadvisory = require('../../../../resource/toggle/image/advisory/noadvisory.svg');

interface OwnProps {
	item: api.ItemDetail;
	showAdvisoryMessage: boolean;
	handleShowAdvisory: (flag: boolean) => void;
}

type Props = OwnProps;

const bemAdvisoryBlock = new Bem('advisory-message');
const bemRatingBlock = new Bem(bemAdvisoryBlock.e('rating'));

class AdvisoryMessage extends React.Component<Props> {
	private hideTimeout: number;

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.showAdvisory();
	}

	componentWillUnmount() {
		window.clearTimeout(this.hideTimeout);
	}

	showAdvisory() {
		const { handleShowAdvisory } = this.props;

		this.hideTimeout = window.setTimeout(() => {
			handleShowAdvisory(false);
		}, ADVISORY_TEXT_TIMER);
	}

	getLimitedAdvisoryText = advisoryText => {
		const advisoryTextArray = advisoryText.split(',').slice(0, MAX_ADVISORY_TEXT_COUNT);
		let combinedText = advisoryTextArray.join(', ');
		if (combinedText.length > MAX_ADVISORY_TEXT_LENGTH) {
			combinedText = combinedText.slice(0, MAX_ADVISORY_TEXT_LENGTH);
		}
		return combinedText;
	};

	render() {
		const { item, showAdvisoryMessage } = this.props;
		const advisoryRating = get(item, 'classification.name');
		let advisoryText = get(item, 'advisoryText');

		if (advisoryText) {
			advisoryText = this.getLimitedAdvisoryText(advisoryText);
		} else if (!!advisoryRating && !advisoryText) {
			advisoryText = getDefaultAdvisoryMessage(item);
		}

		const advisory = advisoryRating && advisoryRating.toLowerCase();
		let advisoryImage;
		if (advisory) {
			advisoryImage = require('../../../../resource/toggle/image/advisory/' + advisory + '.svg');
		}

		return (
			<div className={cx(bemAdvisoryBlock.b({ hidden: !showAdvisoryMessage }), 'col-desktop-16')}>
				{advisoryRating && advisoryImage ? (
					<img className={bemRatingBlock.b(advisoryRating.toLowerCase())} src={advisoryImage} />
				) : (
					advisoryText && <img className={bemRatingBlock.b('na')} src={noadvisory} />
				)}
				{advisoryText && (
					<IntlFormatter elementType={'div'} className={bemAdvisoryBlock.e('text')}>
						{advisoryText}
					</IntlFormatter>
				)}
			</div>
		);
	}
}

export default AdvisoryMessage;
