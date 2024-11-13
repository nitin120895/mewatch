/**
 * Reference App Component Routes
 *
 * Replace this file with your own implementation within `src/viewer/${company}`.
 *
 * You're welcome to include any of our pages within your project or ignore them
 * all and supply your own.
 */

// Because we're consuming this file in both the shell app and the iframe app
// the Component references unfortunately get compiled into the shell app unnecessarily.
// This is acceptable for now considering this is an internal convenience tool and
// won't be used in production.

import Page from './Page';
import PageNotFound from 'ref/responsive/page/PageNotFound';
import Home from './page/Home';
import Typography from './page/Typography';
import Colours from './page/global/Colours';
import TextInputComponent from './page/inputs/TextInputComponent';
import PasswordInputComponent from './page/inputs/PasswordInputComponent';
import PinInputComponent from './page/inputs/PinInputComponent';
import CheckboxComponent from './page/inputs/CheckboxComponent';
import SignInFormComponent from './page/forms/SignInFormComponent';
import SwitchInputComponent from './page/forms/SwitchInputComponent';
import ForgotPasswordComponent from './page/forms/ForgotPasswordComponent';
import ProfilesFormComponent from './page/forms/ProfilesFormComponent';
import TileMetadata from './page/tiles/TileMetadata';
import FormElements from './page/inputs/FormElements';
import Localisation from './page/Localisation';
import SvgPathDrawing from './page/util/SvgPathDrawing';
import ScrollLoader from './page/util/ScrollLoader';
import ItemPackshot from './page/images/ItemPackshot';
import ImageComponent from './page/images/ImageComponent';
import PictureComponent from './page/images/PictureComponent';
import PanelComponents from './page/global/PanelComponents';
import ButtonComponents from './page/global/ButtonComponents';
import OverlayComponents from './page/global/OverlayComponents';
import H1StandardComponent from './page/entries/heroes/H1StandardComponent';
import H2PeekingComponent from './page/entries/heroes/H2PeekingComponent';
import H5ThumbnailsComponent from './page/entries/heroes/H5ThumbnailsComponent';
import H6PeekingComponent from './page/entries/heroes/H6PeekingComponent';
import H7MosaicComponent from './page/entries/heroes/H7MosaicComponent';
import H9ImageComponent from './page/entries/heroes/H9ImageComponent';
import H10TitleComponent from './page/entries/heroes/H10TitleComponent';
import ListHeaderComponent from './page/entries/lists/ListHeaderComponent';
import Dh1StandardComponent from './page/entries/item/heroes/Dh1StandardComponent';
import ItemRowComponents from './page/entries/item/ItemRowComponents';
import SeasonListComponents from './page/entries/item/SeasonListComponents';
import D1EpisodeGridContainer from './page/entries/item/D1EpisodeGridContainer';
import D2EpisodeListContainer from './page/entries/item/D2EpisodeListContainer';
import D3EpisodeRowContainer from './page/entries/item/D3EpisodeRowContainer';
import DRecommendationsComponent from './page/entries/item/DRecommendationsComponent';
import D8Circle from './page/entries/item/D8Circle';
import D9Text from './page/entries/item/D9Text';
import D10Metadata from './page/entries/item/D10Metadata';
import Tx1LinksComponent from './page/entries/text/Tx1LinksComponent';
import BrandedTextComponent from './page/entries/branded/BrandedTextComponent';
import BrandedBackgroundComponent from './page/entries/branded/BrandedBackgroundComponent';
import BrandedImageComponent from './page/entries/branded/BrandedImageComponent';
import Pb1CoverComponent from './page/entries/poster/Pb1CoverComponent';
import B1StandardComponent from './page/entries/block/B1StandardComponent';
import B2LargeComponent from './page/entries/block/B2LargeComponent';
import B3DoubleComponent from './page/entries/block/B3DoubleComponent';
import Ed1ImageComponent from './page/entries/editorial/Ed1ImageComponent';
import Ed2TextComponent from './page/entries/editorial/Ed2TextComponent';
import Ed4ImageTextComponent from './page/entries/editorial/Ed4ImageTextComponent';
import Ed5ButtonComponent from './page/entries/editorial/Ed5ButtonComponent';
import P1StandardComponent from './page/entries/poster/P1StandardComponent';
import P2LargeComponent from './page/entries/poster/P2LargeComponent';
import S1StandardComponent from './page/entries/square/S1StandardComponent';
import S2LargeComponent from './page/entries/square/S2LargeComponent';
import S3DoubleComponent from './page/entries/square/S3DoubleComponent';
import T1StandardComponent from './page/entries/tile/T1StandardComponent';
import T2LargeComponent from './page/entries/tile/T2LargeComponent';
import T3DoubleComponent from './page/entries/tile/T3DoubleComponent';
import WebViewComponent from './page/entries/custom/WebViewComponent';
import AhComponent from './page/entries/account/AhComponent';
import A1DetailsComponent from '../ref/page/entries/account/A1DetailsComponent';
import A2BillingComponent from '../ref/page/entries/account/A2BillingComponent';
import A3DevicesComponent from './page/entries/account/A3DevicesComponent';
import A4ProfilesComponent from './page/entries/account/A4ProfilesComponent';
import A5ParentalLockComponent from './page/entries/account/A5ParentalLockComponent';
import A99SegmentsComponent from './page/entries/account/A99SegmentsComponent';
import AccordionComponents from './page/global/AccordionComponents';
/*
// Commented out as they are not yet supported in reference app
import PaymentMethodsListComponent from './page/account/billing/PaymentMethodsListComponent';
import BillingHistoryComponent from './page/account/billing/BillingHistoryComponent';
*/

// We're defining our routes using the `ReactRouter.RouteConfig` syntax instead of
// JSX so that they can be consumed by both React Router, as well as our side navigation
// bar which isn't using it.
// We've extended its typings to include a title property which is used for the link text.

const routes: any = {
	path: '/',
	component: Page,
	title: 'Table of Contents',
	indexRoute: { component: Home },
	childRoutes: [
		{
			path: 'global',
			title: 'Global',
			childRoutes: [
				{ path: 'typography', component: Typography, title: 'Typography' },
				{ path: 'colours', component: Colours, title: 'Colours' },
				{ path: 'buttons', component: ButtonComponents, title: 'Buttons' }
			]
		},
		{
			path: 'forms',
			title: 'Forms',
			childRoutes: [
				{
					path: 'inputs',
					title: 'Input Elements',
					childRoutes: [
						{
							path: 'text',
							component: TextInputComponent,
							title: 'Text Input'
						},
						{
							path: 'password',
							component: PasswordInputComponent,
							title: 'Password Input'
						},
						{
							path: 'pin',
							component: PinInputComponent,
							title: 'Pin Input'
						},
						{
							path: 'checkbox',
							component: CheckboxComponent,
							title: 'Checkbox'
						},
						{
							path: 'switch',
							component: SwitchInputComponent,
							title: 'Switch Input'
						}
					]
				},
				{
					path: 'signin',
					component: SignInFormComponent,
					title: 'Sign In Form'
				},
				{
					path: 'forgot-password',
					component: ForgotPasswordComponent,
					title: 'Forgot Password'
				},
				{
					path: 'profiles',
					component: ProfilesFormComponent,
					title: 'Profiles Form'
				}
			]
		},
		{
			path: 'tileMetadata',
			component: TileMetadata,
			title: 'Tile Metadata'
		},
		{
			path: 'entries',
			title: 'Page Entries',
			childRoutes: [
				// Follow the group and entry naming scheme from `shared/page/pageEntryTemplate.ts`.
				{
					path: 'item',
					title: 'Item Detail Rows',
					childRoutes: [
						{
							path: 'heroes',
							title: 'DH - Heroes',
							childRoutes: [
								{
									path: 'dh1',
									component: Dh1StandardComponent,
									title: 'DH1 - Hero Standard'
								},
								{
									path: 'components',
									component: ItemRowComponents,
									title: 'Item Detail - Components'
								}
							]
						},
						{
							path: 'std',
							title: 'D - Standard',
							childRoutes: [
								{
									path: 'd1',
									component: D1EpisodeGridContainer,
									title: 'D1 - Episode Grid'
								},
								{
									path: 'd2',
									component: D2EpisodeListContainer,
									title: 'D2 - Episode List'
								},
								{
									path: 'd3',
									component: D3EpisodeRowContainer,
									title: 'D3 - Episode Row'
								},
								{
									path: 'd5-7',
									component: DRecommendationsComponent,
									title: 'D5/D6/D7 - Recommendations'
								},
								{
									path: 'd8',
									component: D8Circle,
									title: 'D8 - Cast & Crew Circle'
								},
								{
									path: 'd9',
									component: D9Text,
									title: 'D9 - Cast & Crew Text'
								},
								{
									path: 'd10',
									component: D10Metadata,
									title: 'D10 - Additional Information'
								},
								{
									path: 'components',
									title: 'Components',
									childRoutes: [
										{
											path: 'seasonList',
											component: SeasonListComponents,
											title: 'Season List & Selector'
										}
									]
								}
							]
						}
					]
				},
				{
					path: 'text',
					title: 'Text Rows',
					childRoutes: [
						{
							path: 'tx1',
							component: Tx1LinksComponent,
							title: 'TX1 - Links'
						}
					]
				},
				{
					path: 'heroes',
					title: 'Hero Header Rows',
					childRoutes: [
						{
							path: 'h1',
							component: H1StandardComponent,
							title: 'H1 - Standard'
						},
						{
							path: 'h2',
							component: H2PeekingComponent,
							title: 'H2 - Peeking'
						},
						{
							path: 'h5',
							component: H5ThumbnailsComponent,
							title: 'H5 - Thumbnails'
						},
						{
							path: 'h6',
							component: H6PeekingComponent,
							title: 'H6 - Peeking'
						},
						{ path: 'h7', component: H7MosaicComponent, title: 'H7 - Mosaic' },
						{ path: 'h9', component: H9ImageComponent, title: 'H9 - Image' },
						{
							path: 'h10',
							component: H10TitleComponent,
							title: 'H10 / H11 - Title Text'
						}
					]
				},
				{
					path: 'block',
					title: 'Block Rows (4:3)',
					childRoutes: [
						{
							path: 'std',
							title: 'B - Standard',
							childRoutes: [
								{
									path: 'b1',
									component: B1StandardComponent,
									title: 'B1 - Standard'
								},
								{
									path: 'b2',
									component: B2LargeComponent,
									title: 'B2 - Large'
								},
								{
									path: 'b3',
									component: B3DoubleComponent,
									title: 'B3 - Double'
								}
							]
						}
					]
				},
				{
					path: 'branded',
					title: 'Branded Rows',
					childRoutes: [
						{
							path: 'cover',
							component: Pb1CoverComponent,
							title: 'Branded Cover'
						},
						{
							path: 'text',
							component: BrandedTextComponent,
							title: 'Branded Text'
						},
						{
							path: 'background',
							component: BrandedBackgroundComponent,
							title: 'Branded Background'
						},
						{
							path: 'image',
							component: BrandedImageComponent,
							title: 'Branded Image'
						}
					]
				},
				{
					path: 'editorial',
					title: 'Editorial Rows',
					childRoutes: [
						{
							path: 'ed1',
							component: Ed1ImageComponent,
							title: 'ED1 - Image'
						},
						{
							path: 'ed2',
							component: Ed2TextComponent,
							title: 'ED2 - Text'
						},
						{
							path: 'ed4',
							component: Ed4ImageTextComponent,
							title: 'ED4 - Image & Text'
						},
						{
							path: 'ed5',
							component: Ed5ButtonComponent,
							title: 'ED5 - Button'
						}
					]
				},
				{
					path: 'poster',
					title: 'Poster Rows (2:3)',
					childRoutes: [
						{
							path: 'std',
							title: 'P - Standard',
							childRoutes: [
								{
									path: 'p1',
									component: P1StandardComponent,
									title: 'P1 - Standard'
								},
								{ path: 'p2', component: P2LargeComponent, title: 'P2 - Large' }
							]
						}
					]
				},
				{
					path: 'square',
					title: 'Square Rows (1:1)',
					childRoutes: [
						{
							path: 'std',
							title: 'S - Standard',
							childRoutes: [
								{
									path: 's1',
									component: S1StandardComponent,
									title: 'S1 - Standard'
								},
								{
									path: 's2',
									component: S2LargeComponent,
									title: 'S2 - Large'
								},
								{
									path: 's3',
									component: S3DoubleComponent,
									title: 'S3 - Double'
								}
							]
						}
					]
				},
				{
					path: 'tile',
					title: 'Tile Rows (16:9)',
					childRoutes: [
						{
							path: 'std',
							title: 'T - Standard',
							childRoutes: [
								{
									path: 't1',
									component: T1StandardComponent,
									title: 'T1 - Standard'
								},
								{
									path: 't2',
									component: T2LargeComponent,
									title: 'T2 - Large'
								},
								{
									path: 't3',
									component: T3DoubleComponent,
									title: 'T3 - Double'
								}
							]
						}
					]
				},
				{
					path: 'lists',
					title: 'List Page Rows',
					childRoutes: [
						{
							path: 'list-header',
							component: ListHeaderComponent,
							title: 'List Header (LH1 & LFH1)'
						}
					]
				},
				{
					path: 'account',
					title: 'Account Rows',
					childRoutes: [
						{
							path: 'std',
							title: 'A - Standard',
							childRoutes: [
								{
									path: 'a1',
									component: A1DetailsComponent,
									title: 'A1 - Details'
								},
								{
									path: 'ah',
									component: AhComponent,
									title: 'AH - Account Heros'
								},
								{
									path: 'a2',
									component: A2BillingComponent,
									title: 'A2 - Subscription & Billing'
								},
								{
									path: 'a3',
									component: A3DevicesComponent,
									title: 'A3 - Devices'
								},
								{
									path: 'a4',
									component: A4ProfilesComponent,
									title: 'A4 - Profiles'
								},
								{
									path: 'a5',
									component: A5ParentalLockComponent,
									title: 'A5 - Parental Lock'
								},
								{
									path: 'a99',
									component: A99SegmentsComponent,
									title: 'A99 - Account Segments'
								}
							]
						}
					]
				},
				{
					path: 'custom',
					title: 'Custom Rows',
					childRoutes: [
						{
							path: 'x2-x3',
							component: WebViewComponent,
							title: 'X2/X3 - Web View (iFrame)'
						}
					]
				}
			]
		},
		/*
		// Commented this section out because we don't have this yet available in the reference app
		 {
		 	path: 'account',
		 	title: 'Account',
		 	childRoutes: [
		 		{ path: 'payment-methods-list', component: PaymentMethodsListComponent, title: 'Payment Methods List' },
		 		{ path: 'billing-history', component: BillingHistoryComponent, title: 'Billing History' }
		 	]
		},
		*/
		{
			path: 'developer',
			title: 'Developer pages',
			childRoutes: [
				{
					path: 'default_form_elements',
					component: FormElements,
					title: 'Default Inputs'
				},
				{
					path: 'images',
					title: 'Images',
					childRoutes: [
						{ path: 'packshot', component: ItemPackshot, title: 'Item Packshot' },
						{ path: 'image', component: ImageComponent, title: 'Image' },
						{ path: 'picture', component: PictureComponent, title: 'Picture ' }
					]
				},
				{
					path: 'panels',
					component: PanelComponents,
					title: 'Panels '
				},
				{
					path: 'overlays',
					component: OverlayComponents,
					title: 'Overlays '
				},
				{
					path: 'accordions',
					component: AccordionComponents,
					title: 'Accordions'
				},
				{
					path: 'localisation',
					component: Localisation,
					title: 'Localisation'
				},
				{
					path: 'utils',
					title: 'Utilities',
					childRoutes: [
						{ path: 'svg', component: SvgPathDrawing, title: 'SVG Path Drawing' },
						{
							path: 'scrollloader',
							component: ScrollLoader,
							title: 'Scroll Loader'
						}
					]
				}
			]
		},
		{
			path: '*',
			component: PageNotFound,
			title: '404'
		}
	]
};

export default routes;
