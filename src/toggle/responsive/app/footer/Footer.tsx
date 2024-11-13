import * as React from 'react';
import { connect } from 'react-redux';
import SecondaryNav from 'ref/responsive/app/nav/SecondaryNav';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import Link from 'shared/component/Link';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import NavEntryLink from 'ref/responsive/app/nav/NavEntryLink';
import SocialLink from 'toggle/responsive/component/SocialLink';

import './Footer.scss';

interface OwnProps {
	onBackToTop?: (e: any) => void;
	focusable?: boolean;
}

interface StateProps {
	footer?: api.NavEntry;
	copyright?: string;
	socialLinks?: api.SocialLinkEntry[];
	isCastActive?: boolean;
}

interface DispatchProps {
	updateSubscriptionEntryPoint: (entryPoint) => void;
}

type FooterProps = StateProps & DispatchProps & OwnProps;

const bem = new Bem('footer');

class Footer extends React.PureComponent<FooterProps, any> {
	public entryClicked = () => {
		const { updateSubscriptionEntryPoint } = this.props;
		updateSubscriptionEntryPoint(MixpanelEntryPoint.Footer);
	};

	render() {
		const { footer, copyright, onBackToTop, focusable, socialLinks, isCastActive } = this.props;

		const footerChildren = footer ? footer.children || [] : [];
		const hasSocialLinks = socialLinks && socialLinks.length;

		return (
			<IntlFormatter
				elementType="footer"
				className={bem.b({ empty: !footer && !copyright })}
				aria-hidden={!focusable}
				role="navigation"
				formattedProps={{ 'aria-label': '@{nav_footer_aria|Footer}' }}
			>
				{footer && footer.label && <NavEntryLink className={bem.e('title')} entry={footer} />}
				<div className={bem.e('content')}>
					{footer && (
						<SecondaryNav
							className={bem.e('nav', { horizontal: footerChildren.length === 1 })}
							entries={[footer]}
							displayCategoryTitle={false}
							autoFocus={false}
							includeContent={false}
							onClickEntry={this.entryClicked}
						/>
					)}
					{hasSocialLinks && (
						<div className={bem.e('social-links')}>
							{socialLinks.map(item => (
								<SocialLink item={item} key={item.title} />
							))}
						</div>
					)}
				</div>

				<div className={bem.e('bottom')}>
					<label className={bem.e('copy', { empty: !copyright })}>{copyright || ''}</label>
					<IntlFormatter
						elementType={Link}
						className={bem.e('back')}
						onClick={onBackToTop}
						componentProps={{ to: '#' }}
					>
						{'@{nav_footer_backToTop_label|Scroll to top}'}
					</IntlFormatter>
				</div>
				{isCastActive && <div className={bem.e('cast-player-buffer')} />}
			</IntlFormatter>
		);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	const { footer, copyright, socialLinks } = state.app.config.navigation;
	const { connectionStatus } = state.player.cast;
	return {
		footer,
		copyright,
		socialLinks,
		isCastActive: connectionStatus === 'Connecting' || connectionStatus === 'Connected'
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(Footer);
