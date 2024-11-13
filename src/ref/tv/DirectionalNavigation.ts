import { KEY_CODE } from './util/keycodes';
import { Focusable } from './focusableInterface';
import { CommonDialog } from './util/CommonDialog';
import { PageNavigationArrow } from './util/PageNavigationArrow';
import { checkIfVisible, calcOffset } from './util/domUtils';
import { waitUntil, wait } from './util/itemUtils';
import sass from 'ref/tv/util/sass';
import KeysModel from 'shared/util/platforms/keysModel';
import { minKeydownInterval } from 'shared/util/platforms/appManager';
import PageScroll from 'ref/tv/util/PageScroll';
import { isHeroEntryTemplate } from 'shared/page/pageEntryTemplate';
import { DomEventSourceType, DomEvents } from 'shared/analytics/types/types';
import { AnalyticsTrigger } from './AnalyticsTriggers';
import { IMPRESSION_TIME_SECS } from 'shared/analytics/config';
import { secondsToMs } from 'shared/util/time';
import { Watch as watchPageTemplate, itemDetailTemplate } from 'shared/page/pageTemplate';

type RefRowsState = { rowIndex: number; savedState: object }[];

type FocusedState = {
	path: HistoryLocation;
	pageTemplate: string;
	rowIndex: number;
	refRows: RefRowsState;
	savedState: object;
	pageTransY: number;
};

export enum GlobalEvent {
	none = 0,
	PAGE_CHANGED,
	GLOBAL_HEADER,
	ROW_CHANGED,
	SCROLL_CHANGED,
	FOCUS_CHANGED,
	ITEM_CLICKED,
	SEARCHED,
	RESIZED,
	BACK_TO_TOP,
	KEYBOARD_VISIBILITY_CHANGE,
	EXIT,
	MOUSE_ACTIVE,
	KEY_DOWN
}

export interface GlobalEventHandler {
	id: string;
	value: (e?) => void;
}

const autoScrollHeight = sass.autoScrollHeight;
const autoScrollSpacing = sass.autoScrollSpacing;

export class DirectionalNavigation {
	static exitWithoutConfirm: boolean;

	private savedFocuseRow: Focusable;
	private savedFocuseRowBefore: Focusable;
	private body;
	private scrollRef: HTMLDivElement;
	private removeRouterListener;
	private router;
	private emitDomEvent: (eventSource: DomEventSourceType, event: Event, data: DomEvents['data']) => void;
	private entryViewedTimer;
	private hasShowGlobalHeader = false;
	isGlobalHeaderVisible = true;

	private offsetY = 0;
	private bodyHeight = sass.viewportHeight;

	private focusedHistory: FocusedState[] = [];
	private curLocation: HistoryLocation;

	private eventMap: { [id: number]: GlobalEventHandler[] } = {};

	private backTopBtnIndex = 99999;

	private isGoingToRow = false;

	private pageScroll: PageScroll;

	mouseActive = false;

	// Sometimes eg when keyboard is showing and there're search results in search page,
	// don't change focus at this time
	disableMouseFocus = false;

	nextAction: 'watch' | 'bookmark' | 'rate' | 'none';

	delayTime: number;
	shouldWaiting: boolean;

	// block the scroll page action for one time,
	// this should only happen when you are sure the page should not scroll while it might need to scroll according to the rules
	// eg: In detail page, move focus from DH1 row to D row, because DH1 will be collapsed, the D row below will be displayed well
	// without page scrolling
	blockScrollOnce: boolean;
	isCollapsed = false;
	pageGoBackHandle = false;
	gotoPageFromMenu = false;

	pageEntries: api.PageEntry[];
	curPageTemplate: string;
	supportedEntriesCount = 0;
	focusableRows: Focusable[] = [];
	curFocusedRow: Focusable;
	visibleRows: Focusable[] = [];
	analytics: AnalyticsTrigger;

	private forceScrollTop: boolean;

	start = () => {
		this.analytics = new AnalyticsTrigger();
		this.analytics.setup(
			{
				getVisibleRows: this.getVisibleRows,
				getOffsetY: this.getOffsetY,
				getBodyHeight: this.getBodyHeight,
				getBackTopBtnIndex: this.getBackTopBtnIndex,
				calcOffsetTop: this.calcOffsetTop
			},
			this.emitDomEvent
		);

		this.removeRouterListener = this.router.listen(this.onRouteChange);

		if (document && document.body) {
			this.body = document.getElementById('root');
			this.scrollRef = document.getElementById('commonLayer') as HTMLDivElement;
		}

		this.pageScroll = new PageScroll({
			duration: 300, // ms
			element: this.scrollRef
		});
	};

	stop = () => {
		this.removeRouterListener();
	};

	setRouter = router => {
		this.router = router;
	};

	setEmitDomEvent = (
		emitDomEvent: (eventSource: DomEventSourceType, event: Event, data: DomEvents['data']) => void
	) => {
		this.emitDomEvent = emitDomEvent;
	};

	addEventHandler = (event: GlobalEvent, id: string, handler: (e?) => void) => {
		if (!this.eventMap[event]) {
			this.eventMap[event] = [];
		}

		if (!id) {
			this.eventMap[event].push({
				id: 'none',
				value: handler
			});
		} else {
			if (this.eventMap[event].find(e => e.id === id)) {
				// Error, for each event, an event handler with the same id could no be added more than 1 time
			} else {
				this.eventMap[event].push({
					id: id,
					value: handler
				});
			}
		}
	};

	removeEventHandler = (event: GlobalEvent, id: string = undefined, handler: (e?) => void = undefined) => {
		if (!this.eventMap[event] || (!id && !handler)) {
			return;
		}

		if (id) {
			const i = this.eventMap[event].findIndex(e => e.id === id);
			if (i >= 0) {
				this.eventMap[event].splice(i, 1);
			}
		} else {
			if (handler) {
				for (let i = this.eventMap[event].length - 1; i >= 0; i--) {
					if (this.eventMap[event][i].value === handler) {
						this.eventMap[event].splice(i, 1);
					}
				}
			} else {
				this.eventMap[event] = [];
			}
		}
	};

	move = (direction, force?: boolean) => {
		if (!this.curFocusedRow) {
			if (this.focusableRows && this.focusableRows.length > 0) {
				this.curFocusedRow = this.focusableRows.find(f => f.index === 0);
			}
		} else {
			if (this.curFocusedRow.index === -1) {
				CommonDialog.show();
			}
		}

		let sourceLeftToViewport = 0;
		if (this.curFocusedRow.getLeftToViewport) {
			sourceLeftToViewport = this.curFocusedRow.getLeftToViewport();
		}

		switch (direction) {
			case KeysModel.Left:
				this.moveLeft(force);
				break;
			case KeysModel.Right:
				this.moveRight(force);
				break;
			case KeysModel.Up:
				this.moveUp(force, sourceLeftToViewport);
				break;
			case KeysModel.Down:
				this.moveDown(force, sourceLeftToViewport);
				break;

			default:
				break;
		}

		this.raiseEvent(GlobalEvent.FOCUS_CHANGED);
	};

	getVisibleRows = (): Focusable[] => {
		return this.visibleRows;
	};

	getOffsetY = (): number => {
		return this.offsetY;
	};

	getBodyHeight = (): number => {
		return this.bodyHeight;
	};

	getBackTopBtnIndex = (): number => {
		return this.backTopBtnIndex;
	};

	getPrevFocusableRow = (index: number, getFocusableRow?: boolean): Focusable => {
		const prevRows = this.focusableRows.filter(r => r.index < index && r.index !== 0);
		let prevRow;

		if (prevRows && prevRows.length > 0) {
			prevRow = prevRows[prevRows.length - 1];

			if (getFocusableRow) {
				const prevFocusableRows = prevRows.filter(r => r.focusable);

				if (prevFocusableRows && prevFocusableRows.length > 0) {
					prevRow = prevFocusableRows[prevFocusableRows.length - 1];
				} else {
					return undefined;
				}
			}
		}

		return prevRow;
	};

	getNextFocusableRow = (index: number): Focusable => {
		const nextRow = this.focusableRows.find(r => r.index > index && r.focusable);
		return nextRow;
	};

	focusPrevRow = (index: number): Focusable => {
		const prevRow = this.getPrevFocusableRow(index, true);
		prevRow && this.moveToRow(prevRow.index);
		return prevRow;
	};

	focusNextRow = (index: number): Focusable => {
		const nextRow = this.getNextFocusableRow(index);
		nextRow && this.moveToRow(nextRow.index);
		return nextRow;
	};

	moveToRow = (index: number, savedState?: object, pageTransY?: number) => {
		if (this.curFocusedRow) {
			if (this.curFocusedRow.index === -1) return;

			if (this.curFocusedRow.index === index) {
				if (savedState) this.curFocusedRow.restoreSavedState(savedState);
				this.scrollPage();
				return;
			}

			if (this.curFocusedRow.index === 0) {
				this.hideGlobalHeader();
			}
		} else {
			if (this.focusableRows && this.focusableRows.length > 0) {
				this.curFocusedRow = this.focusableRows.find(f => f.index === 0);
			}
		}

		const tarRow = this.focusableRows.find(e => {
			return e.index === index;
		});

		if (tarRow) {
			const direction = tarRow.index >= this.curFocusedRow.index ? 'down' : 'up';

			if (tarRow.focusable) {
				this.curFocusedRow.setFocus(false);
				this.curFocusedRow = tarRow;
				tarRow.setFocus(true);
			}

			if (tarRow.restoreSavedState && savedState) tarRow.restoreSavedState(savedState);
			this.scrollY(direction, pageTransY);
		} else {
			wait(
				() => {
					return !!this.focusableRows.find(e => {
						return e.index === index;
					});
				},
				() => {
					this.moveToRow(index, savedState, pageTransY);
				},
				() => {
					this.focusOnFirstRow();
				},
				2000
			);
		}
	};

	calcOffsetTop = (index: number, offsetY = 0): number => {
		this.focusableRows.filter(e => {
			if (e.index < index) {
				if (e.index > 0) {
					if (e.height > 0 && !e.dynamicHeight) {
						const rowHeight = e.maxHeight || e.height;
						const className = e.ref && e.ref.parentElement.className;
						offsetY += rowHeight;

						if (className && className.indexOf('no-bottom-padding') > 0) {
							offsetY += 0;
						} else if (e.template) {
							const entryPadding = isHeroEntryTemplate(e.template)
								? sass.halfPaddingBetweenEntries
								: sass.paddingBetweenEntries;
							offsetY += entryPadding;
						}
					} else {
						const rowOffset = e.ref && calcOffset(e.ref.parentElement);
						const rowHeight = (rowOffset && rowOffset.height) || 0;
						e.height = rowHeight;
						offsetY = rowHeight + offsetY;
					}
				}

				return true;
			}

			return false;
		});

		return offsetY;
	};

	scrollY = (direction?: 'up' | 'down', offsetY = 0, targetIndex?: number) => {
		if (this.blockScrollOnce) {
			this.blockScrollOnce = false;
			return;
		}

		if (offsetY > 0) {
			this.offsetY = offsetY;
			this.scrollPage();
			return;
		}

		if (!this.curFocusedRow) {
			return;
		}

		let curFocusedRowHeight = this.curFocusedRow.height;

		if (this.curFocusedRow.dynamicHeight && this.curFocusedRow.ref) {
			const rowHeight = calcOffset(this.curFocusedRow.ref).height;

			if (rowHeight !== 0 && curFocusedRowHeight !== rowHeight) {
				curFocusedRowHeight = rowHeight;
				this.curFocusedRow.height = curFocusedRowHeight;
			}
		}

		const curFocusedRowInnerTop = this.curFocusedRow.innerTop;
		const curFocusedRowIndex = targetIndex || this.curFocusedRow.index;

		if (curFocusedRowIndex > 0) {
			offsetY = this.calcOffsetTop(curFocusedRowIndex);

			if (curFocusedRowInnerTop && curFocusedRowInnerTop > 0) {
				offsetY += curFocusedRowInnerTop;
			}
		} else if (curFocusedRowIndex < 0) {
			this.offsetY = 0;
			this.scrollPage();
			return;
		}

		if (curFocusedRowIndex === 0 && direction === 'up') {
			this.offsetY = 0;
		}

		if (!direction) {
			// Make sure the bottom of the row is completely displayed on the screen
			while (this.offsetY + this.bodyHeight < offsetY + curFocusedRowHeight) {
				this.offsetY += autoScrollSpacing;
			}

			// Make sure the top of the row is completely displayed on the screen
			while (this.offsetY > offsetY) {
				this.offsetY -= autoScrollSpacing;
			}

			this.scrollPage();

			return;
		}

		if (direction === 'down') {
			const nextFocusableRow = this.getNextFocusableRow(curFocusedRowIndex);

			if (!nextFocusableRow) {
				this.offsetY = offsetY + curFocusedRowHeight - this.bodyHeight;
			} else {
				if (curFocusedRowHeight >= this.bodyHeight * 0.9) {
					this.offsetY = offsetY - autoScrollSpacing;
				} else {
					if (
						this.offsetY + this.bodyHeight - offsetY - curFocusedRowHeight - sass.paddingBetweenEntries <
						autoScrollHeight
					) {
						this.offsetY =
							offsetY + curFocusedRowHeight + sass.paddingBetweenEntries + autoScrollHeight - this.bodyHeight;
					} else {
						return;
					}
				}
			}
		} else {
			const prevFocusableRow = this.getPrevFocusableRow(curFocusedRowIndex);

			if (prevFocusableRow && prevFocusableRow.index > 0) {
				if (curFocusedRowHeight >= this.bodyHeight * 0.9) {
					this.offsetY = offsetY + curFocusedRowHeight + autoScrollSpacing - this.bodyHeight;
				} else {
					if (offsetY - this.offsetY < autoScrollHeight + sass.paddingBetweenEntries) {
						this.offsetY = offsetY - autoScrollHeight - sass.paddingBetweenEntries;
					} else {
						return;
					}
				}
			} else {
				this.offsetY = 0;
			}
		}

		const clientHeight = this.scrollRef.clientHeight;
		if (this.offsetY + this.bodyHeight > clientHeight || curFocusedRowIndex === this.backTopBtnIndex) {
			this.offsetY = clientHeight - this.bodyHeight;
		}

		if (this.offsetY < 0) {
			this.offsetY = 0;
		}

		this.scrollPage();
	};

	moveToTop = () => {
		this.raiseEvent(GlobalEvent.BACK_TO_TOP);
		const firstRow = this.focusableRows.find(e => {
			return e.index > 0 && e.focusable;
		});

		this.offsetY = 0;
		this.scrollPage();
		this.focusOnFirstRow();

		this.focusableRows.map(item => {
			if (item.index > 0 && item.index < this.backTopBtnIndex && item.transY && item.transY < 0) {
				item.restoreSavedState({ transY: 0 });
			}
		});

		this.scrollY(undefined, 0, firstRow.index);
	};

	showGlobalHeader = (fixHeader = false) => {
		if (this.focusableRows && this.focusableRows.length > 0 && this.curFocusedRow && this.curFocusedRow.index !== 0) {
			// index === 0 means it's global header
			const globalHeader = this.focusableRows.find(f => f.index === 0);
			globalHeader.exec(fixHeader ? 'fixHeader' : 'showHeader');
			this.setFocus(globalHeader);
			PageNavigationArrow.hide('top');

			if (!fixHeader) {
				this.hasShowGlobalHeader = true;
			}
		}
	};

	hideGlobalHeader = (fixHeader = false) => {
		if (this.curFocusedRow && this.curFocusedRow.index < 0) return false;

		if (this.focusableRows && this.focusableRows.length > 0) {
			// index === 0 means it's global header
			const globalHeader = this.focusableRows.find(f => f.index === 0);
			const ret = globalHeader.exec(fixHeader ? 'fixHeader' : 'hideHeader');

			if (this.curFocusedRow && this.curFocusedRow.index === 0) {
				if (!fixHeader) this.resetFocus();
			}

			this.hasShowGlobalHeader = false;
			this.displayPageArrow();

			return ret;
		}
	};

	showDialog = (content?: any) => {
		if (this.curFocusedRow && this.curFocusedRow.index === -1) {
			// Error, must close current dialog
			return;
		}

		CommonDialog.showDialog(content);
	};

	hideDialog = () => {
		if (this.curFocusedRow && this.curFocusedRow.index < 0) {
			const ret = CommonDialog.hideDialog();

			if (ret) {
				this.resetFocus();
			}

			return ret;
		}

		return false;
	};

	registerRow = (element: Focusable) => {
		if (
			this.focusableRows.find(e => {
				return e.index === element.index;
			})
		) {
			// error, index could not be the same
			return;
		}
		if (element.forceScrollTop) this.forceScrollTop = true;

		this.focusableRows.push(element);

		this.focusableRows.sort((a, b) => {
			return a.index - b.index;
		});

		if (!this.curFocusedRow) {
			if (this.focusableRows.length > 0) {
				const globalHeader = this.focusableRows.find(f => f.index === 0);
				if (globalHeader.height > 0) {
					this.curFocusedRow = globalHeader;
				} else if (element.focusable && element.index > 0 && element.height > 0) {
					this.curFocusedRow = element;
				}
			}

			if (this.curFocusedRow) {
				this.curFocusedRow.setFocus(true, undefined, undefined, true);
				this.scrollPage();
			}
		}
	};

	unregisterRow = (element: Focusable) => {
		let targetIndex;
		let targetRowIndex;

		for (let i = 0; i < this.focusableRows.length; i++) {
			if (this.focusableRows[i].index === element.index) {
				targetRowIndex = this.focusableRows[i].index;
				targetIndex = i;
				break;
			}
		}

		if (targetIndex !== undefined) {
			if (this.curFocusedRow && this.curFocusedRow.index === targetRowIndex) {
				this.curFocusedRow = undefined;
			}

			if (element.forceScrollTop) this.forceScrollTop = false;

			this.focusableRows.splice(targetIndex, 1);
		}
	};

	setFocus = (element: Focusable) => {
		if (!element) {
			return;
		}

		if (this.curFocusedRow !== element) {
			this.savedFocuseRowBefore = this.curFocusedRow;
			if (element.index >= 0) {
				this.curFocusedRow && this.curFocusedRow.setFocus(false);
			}

			this.curFocusedRow = element;
			this.curFocusedRow.setFocus(true);
		} else {
			this.scrollPage();
		}
	};

	resetFocus = () => {
		if (this.savedFocuseRowBefore) {
			this.curFocusedRow && this.curFocusedRow.setFocus(false);

			this.curFocusedRow = this.focusableRows.find(f => f.index === this.savedFocuseRowBefore.index);

			this.savedFocuseRowBefore = undefined;

			if (!this.curFocusedRow) {
				this.focusOnFirstRow();
			} else {
				this.curFocusedRow.setFocus(true);
			}
		}
	};

	getRowEntry = (index: number): HTMLDivElement => {
		if (!this.body) {
			return;
		}

		const rowId = '#row' + index;

		return this.body.querySelector(rowId);
	};

	getRowEntryNode = (row: Focusable): HTMLDivElement => {
		if (!this.body) {
			return;
		}

		const rowId = '#row' + (Math.floor(row.index / 10) - 1);

		return this.body.querySelector(rowId);
	};

	checkIfVisible = (row: Focusable) => {
		const element = this.getRowEntryNode(row);
		return checkIfVisible(element, this.offsetY, this.bodyHeight);
	};

	requestFocus = (ref: object) => {
		const propName = 'focusableRow';
		if (!ref || !ref.hasOwnProperty(propName)) {
			return;
		}

		this.setFocus(ref[propName]);
	};

	checkFocus = (element: Focusable) => {
		if (!this.curFocusedRow) {
			this.curFocusedRow = element;
			this.curFocusedRow.setFocus(true);
		}
	};

	goBack = () => {
		const history = this.focusedHistory;

		if (history.length > 0) {
			let lastItem = history.pop();
			this.router.goBack();
			this.pageGoBackHandle = true;

			// skip playback page
			while (lastItem.pageTemplate === watchPageTemplate) {
				this.router.goBack();
				lastItem = history.pop();
			}

			this.curFocusedRow && this.curFocusedRow.setFocus(false);
			this.savedFocuseRow = undefined;
			this.savedFocuseRowBefore = undefined;
			this.curFocusedRow = undefined;
			this.restorePage(lastItem.path, lastItem);
		}
	};

	goBackFromWatch = (redirectPath: string) => {
		const history = this.focusedHistory;

		if (history.length > 0) {
			const isDetailPage = itemDetailTemplate[history[history.length - 1].pageTemplate];

			if (redirectPath && !isDetailPage) {
				this.router.replace(redirectPath);
			} else {
				this.goBack();
			}
		} else {
			this.router.replace(redirectPath || '/');
		}
	};

	canPageScroll = () => {
		return this.bodyHeight < this.scrollRef.clientHeight;
	};

	pageResize = () => {
		return this.raiseEvent(GlobalEvent.RESIZED);
	};

	handleInput = e => {
		this.onKeyDown(e);
	};

	handleExit = () => {
		this.raiseEvent(GlobalEvent.EXIT);
	};

	changeEnv = () => {
		this.offsetY = 0;
		this.curFocusedRow = this.focusableRows.length > 0 ? this.focusableRows.find(f => f.index === 0) : undefined;
	};

	onKeyboardVisibilityChange = visible => {
		this.raiseEvent(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, visible);
	};

	onGlobalHeaderDisplayChange = (displayType: 'overlay' | 'show' | 'hide') => {
		this.isGlobalHeaderVisible = false;

		switch (displayType) {
			case 'show':
				this.isGlobalHeaderVisible = true;
				break;
			case 'overlay':
			case 'hide':
				break;
		}

		this.scrollPage();
		this.raiseEvent(GlobalEvent.GLOBAL_HEADER, this.isGlobalHeaderVisible);
	};

	handleRowMouseEnter = (index: number) => {
		if (this.mouseActive) {
			if (!this.curFocusedRow) {
				if (this.focusableRows && this.focusableRows.length > 0) {
					this.curFocusedRow = this.focusableRows.find(f => f.index === 0);
				}
			}

			const tarRow = this.focusableRows.find(e => {
				return e.index === index && e.focusable;
			});

			if (tarRow) {
				if (tarRow.index !== this.curFocusedRow.index) {
					this.curFocusedRow.setFocus(false);
					this.curFocusedRow = tarRow;
					tarRow.setFocus(true);
				} else {
					this.curFocusedRow.setFocus(true);
				}

				this.displayPageArrow();
			}
		}
	};

	displayPageArrow = () => {
		setImmediate(() => {
			if (this.mouseActive) {
				if (this.canPageScroll()) {
					PageNavigationArrow.show();

					if (this.offsetY === 0 && !this.isCollapsed) {
						PageNavigationArrow.hide('top');
					}

					if (this.offsetY + this.bodyHeight >= this.scrollRef.clientHeight) {
						PageNavigationArrow.hide('bottom');
					}
				} else {
					PageNavigationArrow.hide();
				}
			}
		});
	};

	getPageOffsetY = () => {
		return this.offsetY;
	};

	mouseModeActive = (active: boolean) => {
		this.mouseActive = active;
		this.raiseEvent(GlobalEvent.MOUSE_ACTIVE);
	};

	private scrollPageTop() {
		const tmp = this.forceScrollTop;
		this.forceScrollTop = true;
		this.scrollPage();
		this.forceScrollTop = tmp;
	}

	private onRouteChange = loc => {
		const pageTransY = this.offsetY;
		this.offsetY = 0;

		if (!this.curLocation) this.curLocation = loc;

		this.analytics.triggerEntryViewed(true);
		this.scrollPage(true);

		if (loc && loc.key) {
			switch (loc.action) {
				case 'PUSH':
					this.scrollPageTop();
					if (!loc.query['back']) this.onGotoPage(loc, pageTransY);
					break;

				case 'POP':
					this.scrollPageTop();
					break;

				case 'REPLACE':
					this.savedFocuseRow = undefined;

					if (loc.pathname === '/search' && loc.query) {
						this.raiseEvent(GlobalEvent.SEARCHED, loc.query['q']);

						let search = this.focusedHistory.find(f => f.path.pathname === loc.pathname);
						if (search) {
							search.path = loc;
						}

						if (this.curLocation.pathname === loc.pathname) this.curLocation = loc;
					} else {
						this.scrollPageTop();
					}

					return;

				default:
					break;
			}

			this.onPageChanged(loc);
		}
	};

	private restorePage = (tarLoc, savedState) => {
		// restore saved
		// Wait for a little time to make sure the page begin loading
		let delayRestore = true;
		setTimeout(() => {
			delayRestore = false;
		}, 100);
		waitUntil(
			() => {
				return !this.shouldWaiting && !delayRestore;
			},
			() => {
				if (savedState) {
					if (savedState.refRows && savedState.refRows.length > 0) {
						this.restoreRefRowsState(savedState.refRows);
					}
					this.moveToRow(savedState.rowIndex, savedState.savedState, savedState.pageTransY);
				}

				this.curLocation = tarLoc;
				this.onPageChanged(tarLoc, true);
			}
		);
	};

	private onKeyDown = e => {
		if (e.ctrlKey || e.altKey) {
			return;
		}

		this.raiseEvent(GlobalEvent.KEY_DOWN);

		const keyCode = KeysModel.mapKeys(e.keyCode);
		switch (keyCode) {
			case KeysModel.Left:
			case KeysModel.Right:
			case KeysModel.Up:
			case KeysModel.Down:
				if (!e.shiftKey) {
					e.preventDefault();
					this.move(keyCode);
				}
				break;
			case KeysModel.Enter:
				if (!e.shiftKey) {
					e.preventDefault();
					if (this.curFocusedRow) {
						this.raiseEvent(GlobalEvent.ITEM_CLICKED);
						if (this.curFocusedRow.exec) {
							if (this.curFocusedRow.exec('click')) {
								return;
							}
						}

						if (this.curFocusedRow.index === 0) {
							this.move(KeysModel.Down);
						}
					}
				}
				break;

			case KeysModel.Menu:
				if (!e.shiftKey) {
					e.preventDefault();
					if (
						this.curFocusedRow &&
						this.curFocusedRow.index !== 0 &&
						this.curFocusedRow.index !== -1 &&
						this.curPageTemplate !== watchPageTemplate
					) {
						this.showGlobalHeader();
					}
				}
				break;

			case KeysModel.Delete:
				if (!e.shiftKey) {
					if (this.curFocusedRow) {
						if (this.curFocusedRow.exec) {
							this.curFocusedRow.exec('del');
						}
					}
				}
				break;

			case KeysModel.Back:
				if (!e.shiftKey) {
					e.preventDefault();
					e.stopPropagation();
					this.handelEsc();
				}
				break;

			case KeysModel.Exit:
				this.handleExit();
				break;

			case KeysModel.MouseActive:
				this.mouseActive = true;
				this.raiseEvent(GlobalEvent.MOUSE_ACTIVE);
				break;

			case KeysModel.MouseQuiet:
				this.mouseActive = false;
				this.raiseEvent(GlobalEvent.MOUSE_ACTIVE);
				break;

			default:
				if (e.key === 'Escape') {
					this.handelEsc();
					break;
				}

				const key = e.key as string;
				if (key && key.length === 1) {
					const keyCode = key.charCodeAt(0);
					if (keyCode >= KEY_CODE.CHAR_START && keyCode <= KEY_CODE.CHAR_END) {
						if (this.curFocusedRow) {
							if (this.curFocusedRow.exec) {
								this.curFocusedRow.exec(key);
							}
						}
					}
				}

				break;
		}
	};

	handelEsc = () => {
		let handled = false;
		// In search page
		if (this.curLocation && this.curLocation.pathname.indexOf('/search') === 0) {
			if (this.curFocusedRow && this.curFocusedRow.index >= 10) {
				this.moveToRow(1);
				return;
			}
		}

		if (this.curFocusedRow) {
			if (this.curFocusedRow.exec) {
				handled = this.curFocusedRow.exec('esc');

				if (handled) return;
			}
		}
		if (this.hideDialog()) {
			return;
		}

		if (this.hasShowGlobalHeader) {
			this.hideGlobalHeader();
			return;
		}

		if (!this.handleBack()) {
			this.goBack();
		}
	};

	private moveLeft = (force?: boolean) => {
		if (this.curFocusedRow) {
			if (this.curFocusedRow.moveLeft()) {
				// current row cannot move left
			}
		}
	};

	private moveRight = (force?: boolean) => {
		if (this.curFocusedRow) {
			if (!this.curFocusedRow.moveRight()) {
				// current row cannot move right
			}
		}
	};

	private moveUp = (force?: boolean, sourceLeftToViewport?: number) => {
		if (this.curFocusedRow) {
			const curRowIndex = this.curFocusedRow.index;
			if (force || !this.curFocusedRow.moveUp()) {
				if (this.isGoingToRow) {
					return;
				} else {
					this.isGoingToRow = true;
					setTimeout(() => {
						this.isGoingToRow = false;
					}, minKeydownInterval);
				}

				// current row cannot move up
				// move to the up row
				const upRows = this.focusableRows
					.filter(e => {
						return Math.abs(e.index) < Math.abs(curRowIndex);
					})
					.sort((a, b) => {
						return Math.abs(a.index) - Math.abs(b.index);
					});
				const lastUpRow = upRows && upRows.length > 0 && upRows[upRows.length - 1];
				if (lastUpRow) {
					if (lastUpRow.focusable && (lastUpRow.height > 0 || lastUpRow.index === 0)) {
						setTimeout(() => {
							this.delayTime = 0;
							if (this.savedFocuseRow) {
								this.savedFocuseRow.setFocus(false);
								this.savedFocuseRow = undefined;
							} else {
								this.curFocusedRow.setFocus(false);
							}
							this.curFocusedRow = lastUpRow;

							if (!this.curFocusedRow.setFocus(true, sourceLeftToViewport, 'up')) {
								// cannot focus this row, so focus to the next up row
								this.moveUp(force, sourceLeftToViewport);
								return;
							}

							this.scrollY('up');
						}, this.delayTime);
					} else {
						// find next focusable row
						if (!this.savedFocuseRow) this.savedFocuseRow = this.curFocusedRow;
						this.curFocusedRow = lastUpRow;
						this.isGoingToRow = false;
						this.moveUp(force, sourceLeftToViewport);
					}
				} else {
					// Didn't find any up row, show global header
					if (curRowIndex !== 0) {
						this.offsetY = 0;
						this.scrollPage();
						this.showGlobalHeader(true);
					}
				}
			} else {
				if (curRowIndex === 0) this.showGlobalHeader(true);
			}
		} else {
			if (this.focusableRows.length <= 1) {
				this.showGlobalHeader(true);
			}
		}
	};

	private moveDown = (force?: boolean, sourceLeftToViewport?: number) => {
		if (this.curFocusedRow) {
			if (force || !this.curFocusedRow.moveDown()) {
				if (this.isGoingToRow) {
					return;
				} else {
					this.isGoingToRow = true;
					setTimeout(() => {
						this.isGoingToRow = false;
					}, minKeydownInterval);
				}

				// current row cannot move down
				// move to the below row
				const curRowIndex = this.curFocusedRow.index;

				if (curRowIndex === 0 && this.hasShowGlobalHeader) {
					this.hideGlobalHeader();
					return;
				}

				const rowIndexFilter = curRowIndex < 0 ? Math.abs(curRowIndex) : curRowIndex;

				const downRow = this.focusableRows.find(e => {
					return e.index > rowIndexFilter && e.focusable;
				});
				if (downRow) {
					if (downRow.height > 0) {
						setTimeout(() => {
							this.delayTime = 0;
							if (this.savedFocuseRow) {
								this.savedFocuseRow.setFocus(false);
								this.savedFocuseRow = undefined;
							} else {
								this.curFocusedRow.setFocus(false);
							}
							this.curFocusedRow = downRow;
							if (!this.curFocusedRow.setFocus(true, sourceLeftToViewport, 'down')) {
								// cannot focus this row, so focus to the next down row
								this.moveDown(force, sourceLeftToViewport);
								return;
							}

							this.scrollY('down');
						}, this.delayTime);
					} else {
						if (!this.savedFocuseRow) this.savedFocuseRow = this.curFocusedRow;
						this.curFocusedRow = downRow;
						this.isGoingToRow = false;
						this.moveDown(force, sourceLeftToViewport);
					}
				}
			}
		}
	};

	private handleBack = () => {
		// if a common dialog is open
		// close it
		if (this.hideDialog()) {
			return true;
		}

		// if hamburger menu open
		// should close it and focus on hamburger menu item
		if (this.curFocusedRow && this.curFocusedRow.index === -1) {
			this.resetFocus();

			return true;
		}

		// if current page is a featured page, focus should shift to the relevant 'Featured' item
		// with the Global navigation bar

		// if the Global navigation bar is visible, and focus is on the item except the 1st one,
		// focus should shift to the 1st item

		// if the Global navigation is visible, and no featured primary menu item,
		// and a hamburger menu item is available,
		// focus should shift to the hamburger menu item

		if (this.focusableRows.length > 0) {
			const globalHeader = this.focusableRows.find(f => f.index === 0);
			if (globalHeader) {
				return globalHeader.exec('back');
			}
		}

		return false;
	};

	private scrollPage = (isFirstLoad?: boolean) => {
		if (this.offsetY < 0) this.offsetY = 0;

		if (this.scrollRef) {
			this.pageScroll.scrollTo(this.offsetY);
		}

		if (!isFirstLoad && this.visibleRows.length > 0) {
			clearTimeout(this.entryViewedTimer);
			this.entryViewedTimer = setTimeout(() => {
				this.analytics.triggerEntryViewed();
			}, secondsToMs(IMPRESSION_TIME_SECS));
		}

		this.displayPageArrow();
		this.raiseEvent(GlobalEvent.ROW_CHANGED);
		this.raiseEvent(GlobalEvent.RESIZED);
		this.raiseEvent(GlobalEvent.SCROLL_CHANGED, this.offsetY);
	};

	focusOnFirstRow = () => {
		const firstRow = this.focusableRows.find(e => {
			return e.index > 0 && e.index !== this.backTopBtnIndex && e.focusable;
		});

		if (firstRow) {
			this.curFocusedRow && this.curFocusedRow.setFocus(false);
			this.curFocusedRow = firstRow;
			this.curFocusedRow.setFocus(true);
		} else {
			this.showGlobalHeader(true);
			this.moveToRow(0);
		}
	};

	private restoreRefRowsState = (refRows: RefRowsState) => {
		refRows.map(row => {
			const refRow = this.focusableRows.find(r => r.index === row.rowIndex);
			refRow && refRow.restoreSavedState(row.savedState);
		});
	};

	private onPageChanged = (loc: HistoryLocation, isGoback?: boolean) => {
		const callback = () => {
			if (!isGoback && loc.pathname !== '/search') {
				this.visibleRows = this.focusableRows.concat();
				this.analytics.triggerEntryViewed();
			}

			if (isGoback) {
				this.pageGoBackHandle = false;
			}

			this.raiseEvent(GlobalEvent.PAGE_CHANGED);
		};

		if (!isGoback) {
			this.visibleRows = [];
			this.supportedEntriesCount = 0;
		}

		wait(
			() => {
				const supportedEntriesCount = this.supportedEntriesCount || this.pageEntries.length;
				return supportedEntriesCount > 0 && this.focusableRows.length >= supportedEntriesCount + 1;
			},
			callback,
			callback,
			10 * 1000
		);
	};

	private onGotoPage = (loc, pageTransY) => {
		let needRestorePageWhenPush = false;
		let pageIndexInStack;

		if (this.hasShowGlobalHeader) {
			if (loc.query && loc.query['featured']) {
				const pageIndex = this.focusedHistory.findIndex(f => f.path.pathname === loc.pathname);

				if (pageIndex >= 0) {
					needRestorePageWhenPush = true;
					pageIndexInStack = pageIndex;
				}
			}

			this.hideGlobalHeader();
			this.hasShowGlobalHeader = false;
		}

		// save current
		if (this.curFocusedRow) {
			let refRows: RefRowsState = [];
			let curFocusedRowState = undefined;
			this.savedFocuseRow = undefined;

			if (this.curFocusedRow.refRowType) {
				this.focusableRows.map(r => {
					if (r.refRowType === this.curFocusedRow.refRowType) {
						refRows.push({
							rowIndex: r.index,
							savedState: r.savedState
						});
					}
				});
			} else {
				curFocusedRowState = this.curFocusedRow.savedState;
			}

			// for featured page, only save one record for each page
			if (loc.query && loc.query['featured']) {
				const i = this.focusedHistory.findIndex(f => f.path === loc.pathname);
				if (i >= 0) this.focusedHistory.splice(i, 1);
			}

			this.focusedHistory.push({
				path: this.curLocation,
				pageTemplate: this.curPageTemplate,
				rowIndex: this.curFocusedRow.index,
				savedState: curFocusedRowState,
				refRows: refRows,
				pageTransY: pageTransY
			});

			this.curLocation = loc;

			if (this.curFocusedRow && this.curFocusedRow.index >= 0) {
				this.curFocusedRow = undefined;
			}

			if (needRestorePageWhenPush) {
				this.restorePage(loc, this.focusedHistory[pageIndexInStack]);

				this.focusedHistory.splice(pageIndexInStack, 1);
				return;
			}
		}
	};

	private raiseEvent(event: GlobalEvent, e = undefined) {
		if (this.eventMap[event]) {
			for (let i = 0; i < this.eventMap[event].length; i++) {
				this.eventMap[event][i].value(e);
			}
		}
	}
}
