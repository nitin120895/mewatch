import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import MenuItem from './MenuItem';
import * as cx from 'classnames';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { focusedClass, transform } from 'ref/tv/util/focusUtil';
import { InjectedIntl } from 'react-intl';
import TitledListModal from 'ref/tv/component/modal/TitledListModal';
import CommonMsgModal from 'ref/tv/component/modal/CommonMsgModal';
import { updateLocale, hardRefresh } from 'shared/app/appWorkflow';
import { promptSignOut } from 'shared/account/sessionWorkflow';
import { getAvailableServices, getClientService, setClientService } from 'shared/app/environmentUtil';
import * as Locale from 'shared/app/localeUtil';
import * as pageTemplate from 'shared/page/pageTemplate';
import sass from 'ref/tv/util/sass';
import './Hamburger.scss';

interface HamburgerProps extends React.Props<any> {
	navigation?: api.Navigation;
	account?: state.Account;
	lang?: string;
	languages?: api.Language[];
	loading?: boolean;
	pageTemplate?: string;
	focusable?: boolean;
	onMenuItemClick?: () => void;
	updateLocale?: (locale: string) => void;
	hardRefresh?: (path) => void;
	promptSignOut?: () => void;
}

interface HamburgerState {
	selectedEntry?: api.NavEntry;
	focusable?: boolean;
	focusState?: string;
	curPriIndex?: number;
	curSecIndex?: number;
	selectedLanguage?: string;
	primaryItems: api.NavEntry[];
}

const bem = new Bem('hamburger');
const pageTemplateList = [
	pageTemplate.Watch,
	pageTemplate.ListDetail,
	pageTemplate.ListDetailFeatured,
	pageTemplate.MovieDetail,
	pageTemplate.ProgramDetail,
	pageTemplate.ShowDetail,
	pageTemplate.ItemDetail,
	pageTemplate.Account
];

class Hamburger extends React.Component<HamburgerProps, HamburgerState> {
	context: {
		router: ReactRouter.InjectedRouter;
		intl: InjectedIntl;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		intl: React.PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private primaryItems;
	private secondaryItems;
	private ref;
	private closeButton;
	private priItemsDiv;
	private secItemsDiv;
	private curPrimeTransPos = 0;
	private curSecTransPos = 0;
	private languageKey;
	private header;
	private gotoPageFromMenu: boolean;

	constructor(props) {
		super(props);
		const language = Locale.getSavedLanguagePreference() || Locale.defaultLocale;
		this.state = {
			selectedEntry: undefined,
			focusable: props.focusable,
			focusState: 'closeButton', // closeButton, primary, secondary
			selectedLanguage: language,
			primaryItems: []
		};

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			restoreSavedState: this.setState.bind(this),
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentWillMount() {
		this.buildData(this.props, true);
	}

	componentDidMount() {
		this.focusableRow.ref = this.ref;
	}

	componentWillReceiveProps(nextProps: HamburgerProps) {
		const { focusable, navigation, account, loading, pageTemplate } = nextProps;

		if (focusable !== undefined && focusable !== this.state.focusable) {
			this.setState({ focusable });
			this.curPrimeTransPos = 0;
			if (focusable) {
				this.setState({
					selectedEntry: undefined,
					focusState: 'closeButton',
					curPriIndex: undefined,
					curSecIndex: undefined
				});
				this.context.focusNav.setFocus(this.focusableRow);
			} else {
				this.curSecTransPos = 0;
				this.context.focusNav.resetFocus();
			}
		}

		let forceUpdate = false;
		const navAccount = navigation.account;
		if (navAccount) {
			const index = navAccount.children['0'].children.findIndex(e => e.path === '@signout');

			if (account.active) {
				if (index < 0) {
					forceUpdate = true;
					navAccount.children['0'].children.push({
						type: 'item',
						label: this.context.intl.formatMessage({ id: 'signout' }),
						path: '@signout'
					});
				}
			} else {
				if (index >= 0) {
					forceUpdate = true;
					navAccount.children['0'].children.splice(index, 1);
				}
			}
		}

		if (!loading && loading !== this.props.loading && this.gotoPageFromMenu) {
			this.gotoPageFromMenu = false;

			/**
			 * When the user loads a page from the hamburger menu, the focus should be moved to the first item on the page (unless otherwise specified).
			 * Special case:
			 * 1. List Page/Featured List Page: Focus on the first item in the CS row;
			 * 2. Watch Page: Focus on the player control;
			 * 3. Item details page: Focus on the watch CTA;
			 * 4. Account Page: Since the U rows and other parts of the page are loaded separately, the focus stays on the hamburger menu button.
			 */
			if (pageTemplateList.indexOf(pageTemplate) === -1) {
				setImmediate(() => {
					this.context.focusNav.focusOnFirstRow();
					this.context.focusNav.scrollY();
				});
			}
		}

		this.buildData(nextProps, forceUpdate);
	}

	private setFocus = (isFocused?: boolean): boolean => {
		if (!isFocused) {
			const onMenuItemClick = this.props.onMenuItemClick;

			this.setState({ focusable: isFocused });
			if (onMenuItemClick) {
				onMenuItemClick();
			}
		}

		return true;
	};

	private moveLeft = (): boolean => {
		const { focusState } = this.state;

		if (focusState === 'secondary') {
			this.setState({
				focusState: 'primary'
			});
		}

		return true;
	};

	private moveRight = (): boolean => {
		const { focusState, curPriIndex } = this.state;

		if (focusState === 'primary') {
			if (this.primaryItems[curPriIndex].children && this.primaryItems[curPriIndex].children.length > 0) {
				this.setState({
					focusState: 'secondary'
				});
			}
		}

		return true;
	};

	private moveUp = (): boolean => {
		const { focusState, curPriIndex, curSecIndex } = this.state;
		if (focusState === 'primary') {
			if (curPriIndex === 0) {
				this.setState({
					focusState: 'closeButton',
					selectedEntry: undefined
				});
			} else {
				const newPriIndex = curPriIndex - 1;
				this.curSecTransPos = 0;
				this.setState({
					curPriIndex: newPriIndex,
					selectedEntry: this.primaryItems[newPriIndex],
					curSecIndex: 0
				});
			}
		} else if (focusState === 'secondary') {
			if (curSecIndex !== 0) {
				this.setState({
					curSecIndex: curSecIndex - 1
				});
			}
		}

		return true;
	};

	private moveDown = (): boolean => {
		const { focusState, curPriIndex, curSecIndex } = this.state;
		if (focusState === 'closeButton') {
			this.setState({
				focusState: 'primary',
				curPriIndex: 0,
				selectedEntry: this.primaryItems[0],
				curSecIndex: 0
			});
		} else if (focusState === 'primary') {
			if (curPriIndex < this.primaryItems.length - 1) {
				const newPriIndex = curPriIndex + 1;
				this.curSecTransPos = 0;
				this.setState({
					curPriIndex: newPriIndex,
					selectedEntry: this.primaryItems[newPriIndex],
					curSecIndex: 0
				});
			}
		} else if (focusState === 'secondary') {
			if (curSecIndex < this.secondaryItems.length - 1) {
				this.setState({
					curSecIndex: curSecIndex + 1
				});
			}
		}

		return true;
	};

	private exec = (act?: string) => {
		const { languages, promptSignOut } = this.props;
		const { focusState, curPriIndex, curSecIndex, selectedLanguage } = this.state;
		const { focusNav, intl, router } = this.context;

		switch (act) {
			case 'click':
				switch (focusState) {
					case 'closeButton':
						this.closeButton.click();
						break;
					case 'primary': {
						const event = new Event('click');
						this.ref.querySelector('.menu-item--focused').dispatchEvent(event);
						const prePath = this.primaryItems[curPriIndex].path;
						if (prePath) {
							this.gotoPageFromMenu = true;
							focusNav.gotoPageFromMenu = true;
							router.push(prePath);
						}
						break;
					}

					case 'secondary': {
						const event = new Event('click');
						this.ref.querySelector('.menu-item--focused').dispatchEvent(event);
						const secPath = this.secondaryItems[curSecIndex].props.entry.path;
						if (secPath) {
							if (secPath === '@lang') {
								this.closeButton.click();
								const languageOptions = languages.map(lang => {
									return { label: lang.label || lang.title, key: lang.code };
								});
								setImmediate(() =>
									focusNav.showDialog(
										<TitledListModal
											title={'@{select_language|Select Language}'}
											entries={languageOptions}
											selectedKey={selectedLanguage}
											ref={focusNav.requestFocus}
											onItemClicked={this.onItemClickedLang}
										/>
									)
								);
							} else if (secPath === '@env') {
								this.closeButton.click();
								const currentService = getClientService();
								const availableServices = getAvailableServices();
								const options = availableServices.map(service => {
									return { label: service.name || service.rocket, key: service.rocket };
								});
								setImmediate(() => {
									focusNav.showDialog(
										<TitledListModal
											title={intl.formatMessage({ id: 'confirm_env_title' })}
											entries={options}
											selectedKey={currentService.rocket}
											ref={focusNav.requestFocus}
											onItemClicked={this.onItemClickEnv}
										/>
									);
								});
							} else if (secPath === '@signout') {
								this.closeButton.click();
								setImmediate(() => promptSignOut());
							} else {
								this.gotoPageFromMenu = true;
								focusNav.gotoPageFromMenu = true;
								router.push(secPath);
							}
						}
						break;
					}
					default:
						break;
				}
				return true;

			case 'esc':
				break;
			default:
				break;
		}

		return false;
	};

	private onItemClickedLang = (index: number) => {
		const { formatMessage } = this.context.intl;
		this.context.focusNav.hideDialog();
		this.languageKey = this.props.languages[index].code;

		setImmediate(() =>
			this.context.focusNav.showDialog(
				<CommonMsgModal
					captureFocus={true}
					curIndex={0}
					blackBackground={true}
					buttons={['@{ok|OK}', '@{cancel|Cancel}']}
					title={formatMessage(
						{ id: 'confirm_language_title' },
						{ language: this.props.languages[index].label || this.props.languages[index].title }
					)}
					text={
						'@{confirm_language|Please note: Details for certain items may not be available in your chosen language.}'
					}
					onClick={this.onConfirmLanguage}
				/>
			)
		);
	};

	private onConfirmLanguage = (index: number) => {
		if (index === 0) {
			// check if target language is supported
			const lang = Locale.getSupportedLanguage(this.languageKey);
			this.languageKey = lang || Locale.defaultLocale;
			Locale.saveLanguagePreference(this.languageKey);
			this.setState({ selectedLanguage: this.languageKey });
			this.props.updateLocale(this.languageKey);
		}
	};

	private onItemClickEnv = (index: number) => {
		const { focusNav, router } = this.context;
		const currentService = getClientService();
		const availableServices = getAvailableServices();
		const targetEnv = availableServices[index];

		focusNav.hideDialog();

		if (targetEnv && targetEnv.rocket !== currentService.rocket) {
			setClientService(targetEnv);
			focusNav.changeEnv();
			router.push('/');
			window.location.reload();
		}
	};

	onFocusPrimary = newPriIndex => {
		const { curPriIndex } = this.state;
		if (curPriIndex !== newPriIndex) {
			this.setState({
				curPriIndex: newPriIndex,
				selectedEntry: this.primaryItems[newPriIndex],
				curSecIndex: 0
			});
		}
	};

	render() {
		return (
			<div className={bem.b()} ref={this.onRef}>
				{this.renderPrimaryItems()}
				{this.renderSecondaryItems()}
			</div>
		);
	}

	private onRef = ref => {
		this.ref = ref;
	};

	private onCloseButtonRef = ref => {
		this.closeButton = ref;
	};

	private onRefPrimary = ref => {
		this.priItemsDiv = ref;
	};

	private onSecPrimary = ref => {
		this.secItemsDiv = ref;
	};

	private mouseEnterPrimaryMenuItem = index => {
		this.setState({ focusState: 'primary' });
		this.onFocusPrimary(index);
	};

	private mouseEnterSecondaryMenuItem = index => {
		this.setState({ focusState: 'secondary', curSecIndex: index });
	};

	private handleMouseClickMenuItem = () => {
		setImmediate(() => {
			this.exec('click');
		});
	};

	private handleMouseEnterCloseBtn = () => {
		this.setState({ focusState: 'closeButton' });
	};

	private renderCloseButton(): any {
		const focusedClassName = this.state.focusState === 'closeButton' ? focusedClass : '';
		return (
			<button
				ref={this.onCloseButtonRef}
				className={cx(bem.e('close'), focusedClassName)}
				onClick={this.props.onMenuItemClick}
				onMouseEnter={this.handleMouseEnterCloseBtn}
			>
				<i className={cx('icon icon-close-button', bem.e('stroke'), focusedClassName)} />
			</button>
		);
	}

	private renderPrimaryItems(): any {
		const { selectedEntry, focusState, primaryItems, curPriIndex } = this.state;

		// make sure current item visible
		let transformPos = this.curPrimeTransPos;
		if (this.priItemsDiv) {
			const clientHeight = this.priItemsDiv.clientHeight;
			const curItemDiv = this.priItemsDiv.querySelector(
				'.hamburger__primary-items .menu-item:nth-child(' + ((curPriIndex ? curPriIndex : 0) + 2) + ')'
			);

			if (curItemDiv) {
				const curItemOffsetY = curItemDiv.offsetTop;
				const curItemHeight = curItemDiv.offsetHeight;

				if (transformPos + clientHeight < curItemOffsetY + curItemHeight) {
					transformPos = curItemOffsetY - sass.autoScrollSpacing;
				}

				if (transformPos > curItemOffsetY) {
					transformPos = curItemOffsetY + curItemHeight - clientHeight + sass.autoScrollSpacing;
				}
			} else {
				transformPos = 0;
			}
		}

		transformPos = Math.max(transformPos, 0);
		this.curPrimeTransPos = transformPos;
		const styleTransform = transform(-transformPos + 'px', sass.transitionDuration, 0, true);

		return (
			<div className={cx(bem.e('primary-panel'))}>
				<div className={cx(bem.e('primary-items'))} ref={this.onRefPrimary} style={styleTransform}>
					{this.renderCloseButton()}
					{primaryItems.map((e, i) => (
						<MenuItem
							key={i}
							index={i}
							entry={e}
							entryType={'primary'}
							onItemClick={this.handleMouseClickMenuItem}
							focused={selectedEntry === e && focusState === 'primary'}
							onFocus={this.onFocusPrimary}
							onMouseEnter={this.mouseEnterPrimaryMenuItem}
							selected={selectedEntry === e}
						/>
					))}
				</div>
			</div>
		);
	}

	private renderSecondaryItems(): any {
		const { selectedEntry, focusState, curSecIndex } = this.state;
		if (!selectedEntry || !selectedEntry.children || selectedEntry.children.length === 0) return <div />;

		const menuItems = [];
		let secIndex = -1;

		for (let i = 0; i < selectedEntry.children.length; i++) {
			const e = selectedEntry.children[i];

			if (e.label) {
				secIndex++;
				menuItems.push(
					<MenuItem
						key={i.toString()}
						index={secIndex}
						entry={e}
						entryType={'group'}
						secondary={true}
						focused={focusState === 'secondary' && curSecIndex === secIndex}
						onItemClick={this.handleMouseClickMenuItem}
						onMouseEnter={this.mouseEnterSecondaryMenuItem}
					/>
				);
			}

			if (e.children) {
				e.children.map((e, k) => {
					secIndex++;
					menuItems.push(
						<MenuItem
							key={i.toString() + k.toString()}
							index={secIndex}
							entry={e}
							entryType={'item'}
							secondary={true}
							onItemClick={this.handleMouseClickMenuItem}
							focused={focusState === 'secondary' && curSecIndex === secIndex}
							selected={curSecIndex === secIndex && selectedEntry === e}
							onMouseEnter={this.mouseEnterSecondaryMenuItem}
						/>
					);
				});
			}
		}

		// make sure current item visible
		let secTransformPos = this.curSecTransPos;
		if (this.secItemsDiv) {
			const clientHeight = this.secItemsDiv.clientHeight;
			const curItemDiv = this.secItemsDiv.querySelector('.menu-item--secondary:nth-child(' + (curSecIndex + 1) + ')');

			if (curItemDiv) {
				const curItemOffsetY = curItemDiv.offsetTop;
				const curItemHeight = curItemDiv.offsetHeight;

				if (secTransformPos + clientHeight < curItemOffsetY + curItemHeight) {
					secTransformPos = curItemOffsetY - sass.autoScrollSpacing;
				}

				if (secTransformPos > curItemOffsetY) {
					secTransformPos = curItemOffsetY + curItemHeight - clientHeight + sass.autoScrollSpacing;
				}
			} else {
				secTransformPos = 0;
			}
		}

		secTransformPos = Math.max(secTransformPos, 0);
		this.curSecTransPos = secTransformPos;
		this.secondaryItems = menuItems;

		const styleTransform = transform(-secTransformPos + 'px', sass.transitionDuration, 0, true);

		return (
			<div className={bem.e('secondary-panel')} ref={this.onSecPrimary} style={styleTransform}>
				{menuItems}
			</div>
		);
	}

	private buildData = (props, forceUpdate = false) => {
		const { account } = props.navigation;
		const header = props.navigation.header.filter(e => !!e.label);

		if (!forceUpdate && this.header === header) {
			return;
		}

		this.header = header;

		let footer = this.convertFooter(props, this.context);

		if (props.account.active) {
			this.primaryItems = header.concat(account, footer);
		} else {
			this.primaryItems = header.concat(footer);
		}

		this.setState({ primaryItems: this.primaryItems });
	};

	private convertFooter(props, context): api.NavEntry {
		const footer = props.navigation.footer || {
			label: context.intl.formatMessage({ id: 'more_btn' }),
			children: [{ children: [] }]
		};

		const envIndex = footer.children[0].children.findIndex(e => e.path === '@env');
		const currentService = getClientService();
		if (_DISCOVER_ && envIndex < 0) {
			footer.children[0].children.push({
				type: 'item',
				label: currentService.rocket,
				path: '@env'
			});
		}

		const index = footer.children[0].children.findIndex(e => e.path === '@lang');
		if (index < 0 && props.languages && props.languages.length > 1) {
			const { languages, lang } = props;
			let targetLanguage: api.Language = languages.find(({ code }) => code === lang);
			if (!targetLanguage) targetLanguage = languages.find(({ code }) => code === Locale.defaultLocale);
			footer.children[0].children.push({
				type: 'item',
				label: targetLanguage.label || targetLanguage.title,
				path: '@lang'
			});
		}

		if (footer && footer.children && footer.children.length > 0) {
			footer.children[0].label = context.intl.formatMessage({ id: 'nav_footer_aria' });
		}

		return footer;
	}
}

function mapStateToProps(state: state.Root): HamburgerProps {
	const { app, account, page, session } = state;
	const { config, i18n, chunkLoading } = app;

	return {
		navigation: config.navigation,
		account,
		lang: i18n.lang,
		languages: config.i18n && config.i18n.languages,
		loading: chunkLoading || page.loading || session.showLoading,
		pageTemplate: page.history.pageSummary.template
	};
}

function mapDispatchToProps(dispatch: any): HamburgerProps {
	return {
		updateLocale: locale => dispatch(updateLocale(locale)),
		hardRefresh: path => dispatch(hardRefresh(path)),
		promptSignOut: () => dispatch(promptSignOut())
	};
}

export default connect<any, any, HamburgerProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(Hamburger);
