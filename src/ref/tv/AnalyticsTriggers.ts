import { DomEventSourceType, DomEvents, EntryProps, CTATypes, EventName } from 'shared/analytics/types/types';
import { getDomEventDataEntry, getImageData } from 'shared/analytics/getContext';
import { EntryContext, Image } from 'shared/analytics/types/v3/context/entry';
import { Focusable } from './focusableInterface';
import { isArray } from 'shared/util/objects';

export interface IFocusNavGetter {
	getVisibleRows: () => Focusable[];
	getOffsetY: () => number;
	getBodyHeight: () => number;
	getBackTopBtnIndex: () => number;
	calcOffsetTop: (index: number, offsetY?: number) => number;
}

type IEmitDomEvent = (eventSource: DomEventSourceType, event: Event, data: DomEvents['data']) => void;

export class AnalyticsTrigger {
	private focusNav: IFocusNavGetter;
	private emit: IEmitDomEvent;

	setup(focusNavGetter: IFocusNavGetter, emitDomEvent: IEmitDomEvent): void {
		this.focusNav = focusNavGetter;
		this.emit = emitDomEvent;
	}

	triggerItemWatched(canPlay: boolean, item: api.ItemSummary, title?: string): void {
		if (canPlay) {
			this.emit(DomEventSourceType.CTA, { type: 'click' } as Event, {
				type: CTATypes.Watch,
				data: { item }
			});
		} else {
			const offer = !!item && !!item.offers && item.offers[0];
			this.emit(DomEventSourceType.CTA, { type: 'click' } as Event, {
				type: CTATypes.Offer,
				data: { offer, item, title }
			});
		}
	}

	triggerItemEvents(
		eventType: 'CLICK' | 'MOUSEENTER' | 'MOUSELEAVE',
		item: api.ItemSummary,
		entryProps: EntryProps,
		index: number,
		imageType?: image.Type | image.Type[],
		entryImageDetails?: Image
	): void {
		const entryContext = getDomEventDataEntry(entryProps);
		imageType = (entryProps as any).imageType || imageType;

		if (isArray(imageType)) {
			imageType = imageType.find(type => !!(item && item.images && item.images[type]));
		}

		const image = getImageData(item, imageType);
		const type = EventName[eventType] as string;
		this.emit(DomEventSourceType.Item, { type } as Event, {
			item,
			entry: { ...entryContext, image: entryImageDetails } as EntryContext,
			index,
			image
		});
	}

	triggerEntryInteracted(entryProps: EntryProps, entryImageDetails?: Image): void {
		const entryContext = getDomEventDataEntry(entryProps);
		this.emit(DomEventSourceType.Entry, { type: 'hscroll' } as Event, {
			entry: { ...entryContext, image: entryImageDetails } as EntryContext
		});
	}

	triggerEntryViewed(isAppFirstLoad?: boolean): void {
		if (isAppFirstLoad) {
			this.emit(DomEventSourceType.Entry, { type: 'viewed' } as Event, { entry: undefined });
			return;
		}

		const visibleRows = this.focusNav.getVisibleRows && this.focusNav.getVisibleRows();

		if (!visibleRows || visibleRows.length === 0) return;

		const rows = visibleRows.concat();
		rows.map(row => {
			const rowIndex = row.index;
			const index = visibleRows.findIndex(row => row.index === rowIndex);
			const backTopBtnIndex = this.focusNav.getBackTopBtnIndex();

			if (!row.entryProps || rowIndex === 0 || rowIndex === backTopBtnIndex || rowIndex === backTopBtnIndex - 1) {
				visibleRows.splice(index, 1);
				return;
			}

			let rowTop = this.focusNav.calcOffsetTop(rowIndex);
			const curFocusedRowInnerTop = row.innerTop;

			if (curFocusedRowInnerTop && curFocusedRowInnerTop > 0) {
				rowTop += curFocusedRowInnerTop;
			}

			const rowHeight = row.height;
			const midpointY = rowHeight / 2 + rowTop;
			const offsetY = this.focusNav.getOffsetY();

			if (rowHeight > 1 && midpointY >= offsetY && midpointY <= offsetY + this.focusNav.getBodyHeight()) {
				const entryContext = getDomEventDataEntry(row.entryProps as EntryProps);
				this.emit(DomEventSourceType.Entry, { type: 'viewed' } as Event, {
					entry: { ...entryContext, image: row.entryImageDetails } as EntryContext
				});
				visibleRows.splice(index, 1);
			}
		});
	}
}
