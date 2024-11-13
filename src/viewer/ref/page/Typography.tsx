import * as React from 'react';
import TypestyleEntry from './TypestyleEntry';

import './Typography.scss';

// Manual import below necessary for player text entries to style correctly
import 'ref/responsive/player/PlayerMetadata.scss';

export default class Typography extends React.Component<PageProps, any> {
	renderTypeSpec(typeElement: Element, specRoot: Element) {
		let computedStyle = getComputedStyle(typeElement);
		let fontSize: String = computedStyle.fontSize;
		let specHTML = (
			<p>
				Font-size: <span className="font-size">{fontSize}</span>
			</p>
		);
		console.log(specHTML);
	}
	render() {
		// This may look long-winded, but the HTML for each text node can be a little different, with different css resets necessary.
		// NOTE: It is mportant to add the 'text-node' class to the right element so we can target this in <TypestyleEntry> and work out the css values automatcially

		let heroTitleHTML = (
			<div className="hero-title-reset carousel-text carousel-text--large-title">
				<h1 className="text-node carousel-text__title-reset carousel-text__title heading-shadow">Hero Title</h1>
			</div>
		);

		let playerTitleHTML = (
			<div className="player-metadata">
				<h4 className="player-metadata__title-reset player-metadata__title title-container">
					<span className="text-node title-container__text">Player title</span>
				</h4>
			</div>
		);

		let itemDetailHeroTitleHTML = (
			<h1 className="text-node dh1-hero__title-reset dh1-hero__title heading-shadow">Item detail title</h1>
		);

		let rowTitleHTML = (
			<h4 className="entry-title">
				<a className="text-node entry-title__link" href="/list/Movies_(Latest)_431">
					Row title
				</a>
			</h4>
		);

		let playerDescriptionHTML = (
			<div className="player-metadata__description-reset player-metadata__description">
				<p className="text-node">Player: description / synopsis</p>
			</div>
		);

		let heroTaglineHTML = (
			<p className="text-node carousel-text__tagline-reset carousel-text__tagline">Hero tagline text</p>
		);

		let heroBadgeTextHTML = (
			<p className="text-node carousel-text__badge-reset carousel-text__badge">movie of the week</p>
		);

		let primaryCTALargeHTML = (
			<button
				type="button"
				className="text-node cta-btn cta-btn--dark cta-btn--primary cta-btn--primary-dark ed5__btn truncate"
			>
				Primary CTA large
			</button>
		);

		let primaryCTASmallHTML = (
			<button
				type="button"
				className="text-node cta-btn cta-btn--dark cta-btn--primary cta-btn--primary-dark cta-btn--small truncate"
			>
				Primary CTA small
			</button>
		);

		let toggleButtonHTML = (
			<button className="cta-toggle-btn bookmark-btn dh1-hero__sec-btn">
				<svg className="cta-toggle-btn__icon svg-icon">
					<path d="m12,0v24m-12,-12h24" fill="currentColor" stroke="currentStroke" />
				</svg>
				<span className="text-node cta-toggle-btn__label">Toggle label</span>
			</button>
		);

		let seasonSelectorHTML = (
			<div className="d1-season-list__item-reset d1-season-list__item d1-season-list__item--active d1-season-list__item--scrollable col col-phone-8 col-phablet-6 col-tablet-4 col-laptop-3 col-desktopWide-2">
				<a className="text-node d1-season-list__link" href="/season/Vikings_S1_2215">
					Season Selector
				</a>
			</div>
		);

		let primaryMenuItemHTML = (
			<a className="text-node primary-nav__entry-link-reset primary-nav__entry-link" href="/">
				Primary Menu item
			</a>
		);

		let linkHTML = (
			<a
				className="text-node link-reset nav-entry-link nav-entry-link--item truncate secondary-nav__link secondary-nav__link--item"
				role="menuitem"
				href="/about/privacy"
			>
				<span>Link (menu, footer, item details)</span>
			</a>
		);

		let footerHeadingHTML = (
			<label className="text-node nav-entry-link nav-entry-link--primary nav-entry-link--disabled truncate footer__title">
				<span>Footer heading</span>
			</label>
		);

		let menuSubHeadingHTML = (
			<label className="text-node nav-entry-link nav-entry-link--group nav-entry-link--disabled truncate vertical-nav-group__link">
				<span>Menu sub-heading</span>
			</label>
		);

		let tileTitleHTML = (
			<span className="text-node packshot-title packshot-title--below truncate">Tile title text</span>
		);

		let itemDetailsMetadataHTML = (
			<div className="dh1-hero__meta-block-reset dh1-hero__meta-block">
				<span className="text-node" aria-hidden="true">
					133 mins
				</span>
			</div>
		);

		let ed4TitleHTML = <h3 className="text-node ed4__heading">ED4 Editorial Text + Image: - Title</h3>;

		let ed4TextHTML = <p className="text-node ed4__description">ED4 Editorial Text + Image: Description</p>;

		return (
			<main className="component">
				<TypestyleEntry typeElement={primaryMenuItemHTML} />
				<TypestyleEntry typeElement={menuSubHeadingHTML} />
				<TypestyleEntry typeElement={linkHTML} />
				<TypestyleEntry typeElement={heroTitleHTML} />
				<TypestyleEntry typeElement={heroTaglineHTML} />
				<TypestyleEntry typeElement={heroBadgeTextHTML} />
				<TypestyleEntry typeElement={itemDetailHeroTitleHTML} />
				<TypestyleEntry typeElement={seasonSelectorHTML} />
				<TypestyleEntry typeElement={toggleButtonHTML} />
				<TypestyleEntry typeElement={rowTitleHTML} />
				<TypestyleEntry typeElement={primaryCTALargeHTML} />
				<TypestyleEntry typeElement={primaryCTASmallHTML} />
				<TypestyleEntry typeElement={playerTitleHTML} />
				<TypestyleEntry typeElement={playerDescriptionHTML} />
				<TypestyleEntry typeElement={footerHeadingHTML} />
				<TypestyleEntry typeElement={tileTitleHTML} />
				<TypestyleEntry typeElement={itemDetailsMetadataHTML} />
				<TypestyleEntry typeElement={ed4TitleHTML} />
				<TypestyleEntry typeElement={ed4TextHTML} />
			</main>
		);
	}
}
