import { AnalyticsEventMap } from './analyticsEventMap';

export type Unionize<T> = T[keyof T];
export type TrackingEvent = Unionize<AnalyticsEventMap>;
