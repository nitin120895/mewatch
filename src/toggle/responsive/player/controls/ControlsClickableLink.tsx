import * as React from 'react';
import * as cx from 'classnames';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'toggle/responsive/component/CtaButton';
import ClickableIcon from './icons/ClickableIcon';
import './ControlsClickableLink.scss';

export const SELECTED_LANGUAGE = 'selectedLanguage';

/**
 * Note:-->
 * 1.) isShowInfoIcon state variable to keep track of whether the  info icon should be displayed or not.
 * 2.) isShowExtendedLink state variable to keep track of whether the  extended Link container should be displayed or not.
 * 3.)timer state variable to keep track of the timeout.
 *
 *  setExternalLinkContainerRef that takes a node and sets it as the value of this.externalContainerRef.
 *  binding this.setExternalLinkContainerRef to this in the constructor to ensure that this refers to the component
 *  instance in the setExternalLinkContainerRef function. We then pass this.setExternalLinkContainerRef as a callback to the ref attribute
 *  of the container element. This allows us to access the container element using this.externalContainerRef in the event handler
 *  for clicking outside of the container.
 */
interface State {
	isContainerTriggeredInitially: boolean;
	isShowInfoIcon: boolean;
	isShowExtendedLink: boolean;
	timer: NodeJS.Timer | null;
	shopUrl: string;
	shopBtn: string;
	shopDesc: string;
}

interface DispatchProps {}

interface StateProps {}

interface OwnProps extends React.Props<any> {
	className?: string;
	clickableLinkUrl?: string;
	currentTime?: number;
	item?: any;
}
type Props = DispatchProps & OwnProps & StateProps;

const bem = new Bem('clickable-link-container');
const englishDescriptionLimit = 42;
const chineseDescriptionLimit = 20;
const englishLabelLimit = 9;
const chineseLabelLimit = 4;
const clickablelinkTimer = 5000;

class ControlsClickableLink extends React.Component<Props, State> {
	private externalContainerRef: HTMLElement;

	constructor(props) {
		super(props);
		this.state = {
			isContainerTriggeredInitially: false,
			isShowInfoIcon: false,
			isShowExtendedLink: false,
			timer: undefined,
			shopUrl: '',
			shopBtn: '',
			shopDesc: ''
		};
		this.setExternalLinkContainerRef = this.setExternalLinkContainerRef.bind(this);
	}

	/**
	 * In componentWillUnmount, we clear the timer to avoid any memory leaks.
	 */

	componentDidMount() {
		const link = this.props.clickableLinkUrl.split('|');
		this.setState({ shopUrl: link[0], shopBtn: link[1], shopDesc: link[2] });
		// Prevent container re-render on subsequent clicks once shown initially
		if (!this.state.isContainerTriggeredInitially) {
			this.setState({ isShowExtendedLink: true, isContainerTriggeredInitially: true });
		} else {
			this.setState({ isShowInfoIcon: true });
		}
		this.startTimer();
	}

	componentWillUnmount() {
		clearTimeout(this.state.timer!);
		document.removeEventListener('mousemove', this.resetTimer);
		document.removeEventListener('keydown', this.resetTimer);
	}

	setExternalLinkContainerRef = node => {
		this.externalContainerRef = node;
	};

	handleClick = () => {
		/**
		 *  info icon hides immediately after hover and not able to capture the event on mixpanel analytics
		 *  So we need some delay on hide info icon thats why using settimeout used here
		 */
		setTimeout(() => {
			this.setState({ isShowInfoIcon: false, isShowExtendedLink: true });
			this.startTimer();
			/**
			 * document.addEventListener method to add a mousedown event listener to the entire document.
			 * When the event listener is triggered, we can check if the click occurred outside the container by checking
			 * if the container's ref does not contain the event target.
			 *  If the click occurred outside the container, we can hide the container and show the info button again.
			 */
		}, 300);
		document.addEventListener('mousedown', this.handleClickOutside);
	};

	handleClickOutside = event => {
		if (this.externalContainerRef && !this.externalContainerRef.contains(event.target)) {
			this.hideContainer();
		}
	};

	hideContainer = () => {
		this.setState({ isShowInfoIcon: true, isShowExtendedLink: false });
		this.stopTimer();
		document.removeEventListener('mousedown', this.handleClickOutside);
	};

	handleShopNow = () => {
		window.open(this.state.shopUrl, '_blank');
		this.hideContainer();
	};

	/** We added startTimer and stopTimer functions to handle starting and stopping the timer, respectively. */

	startTimer = () => {
		const timer = setTimeout(() => {
			this.hideContainer();
		}, clickablelinkTimer);

		this.setState({ timer: timer });
		document.addEventListener('mousedown', this.handleClickOutside);
		document.addEventListener('mousemove', this.resetTimer);
		document.addEventListener('keydown', this.resetTimer);
	};

	stopTimer = () => {
		clearTimeout(this.state.timer);
		this.setState({ timer: undefined });
		document.removeEventListener('mousemove', this.resetTimer);
		document.removeEventListener('keydown', this.resetTimer);
	};

	/**
	 * resetTimer function to handle resetting the timer when the user moves the mouse or presses a key.
	 * Attached resetTimer to the onMouseMove and onKeyDown
	 *  events using document.addEventListener in startTimer and removed it in stopTimer.
	 */

	resetTimer = () => {
		clearTimeout(this.state.timer);
		this.startTimer();
	};

	render() {
		const { className, currentTime, item } = this.props;
		const { isShowInfoIcon, isShowExtendedLink, shopBtn, shopDesc, shopUrl } = this.state;
		return (
			<div className={cx(className, bem.b())}>
				{isShowInfoIcon && (
					<CTAWrapper
						type={CTATypes.InfoIcon}
						data={{ item: item, linkUrl: shopUrl, linkCta: shopBtn, linkDescription: shopDesc, currentTime }}
					>
						<div onClick={this.handleClick} onMouseEnter={this.handleClick}>
							<ClickableIcon className={bem.e('clickable-icon')} />
						</div>
					</CTAWrapper>
				)}
				{isShowExtendedLink && this.renderExtendedLink()}
			</div>
		);
	}
	renderExtendedLink() {
		const { shopBtn, shopDesc, shopUrl } = this.state;
		const { item, currentTime } = this.props;
		let shortDesc, shortLabel;

		if (shopDesc.match(/[\u3400-\u9FBF]/) && shopDesc.length >= chineseDescriptionLimit) {
			shortDesc = shopDesc.substring(0, chineseDescriptionLimit);
		} else if (shopDesc.length >= englishDescriptionLimit) {
			shortDesc = shopDesc.substring(0, englishDescriptionLimit);
		} else {
			shortDesc = shopDesc;
		}
		if (shopBtn.match(/[\u3400-\u9FBF]/) && shopBtn.length >= chineseLabelLimit) {
			shortLabel = shopBtn.substring(0, chineseLabelLimit);
		} else if (shopBtn.length >= englishLabelLimit) {
			shortLabel = shopBtn.substring(0, englishLabelLimit);
		} else {
			shortLabel = shopBtn;
		}
		return (
			<CTAWrapper
				type={CTATypes.InfoLink}
				data={{
					linkCta: shopBtn,
					linkDescription: shopDesc,
					linkUrl: shopUrl,
					item,
					currentTime
				}}
			>
				<div
					className={cx(bem.e('expanded-link'))}
					ref={this.setExternalLinkContainerRef}
					onMouseLeave={this.hideContainer}
				>
					<div className={bem.e('description')} onClick={this.handleShopNow}>
						<IntlFormatter elementType="span">{shortDesc}</IntlFormatter>
					</div>

					<CtaButton type="button" ordinal="primary" theme="dark" small onClick={this.handleShopNow}>
						{shortLabel}
					</CtaButton>
				</div>
			</CTAWrapper>
		);
	}
}

export default ControlsClickableLink;
