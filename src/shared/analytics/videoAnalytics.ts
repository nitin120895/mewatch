import { ItemContextProperty } from 'shared/analytics/types/v3/context';
import {
	IVideoActionTrackingEventDetail,
	IVideoCanPlayActionDetail,
	IVideoErrorTrackingEventDetail,
	IVideoEventDetail,
	IVideoTrackingEventDetail
} from 'shared/analytics/types/v3/event/videoEvents';

export interface IVideoAnalytics {
	disable(): void;
	enable(): void;
	isEnabled(): boolean;
	videoInitialized(context: ItemContextProperty): void;
	videoRequested(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoBuffering(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoCanPlay(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void;
	videoPlaying(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoProgressed(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoCompleted(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoError(context: ItemContextProperty, detail: IVideoErrorTrackingEventDetail): void;
	videoActioned(context: ItemContextProperty, detail: IVideoActionTrackingEventDetail): void;
	videoPaused(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoResumed(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoSeeked(context: ItemContextProperty, detail: IVideoEventDetail): void;
	videoRestarted(context: ItemContextProperty): void;
	videoChainplayed(context: ItemContextProperty, detail: IVideoTrackingEventDetail): void;
	videoAdStarted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void;
	videoAdCompleted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void;
	videoAdSkipped(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void;
}

export abstract class VideoAnalyticsBase implements IVideoAnalytics {
	protected enabled: boolean;
	protected logger: ILogger = new EmptyLogger();

	constructor(enabled: boolean) {
		this.enabled = enabled;
	}
	disable(): void {
		this.enabled = false;
	}
	enable(): void {
		this.enabled = true;
	}
	isEnabled(): boolean {
		return this.enabled;
	}
	videoInitialized(context: ItemContextProperty): void {
		if (this.isEnabled()) this.notifyVideoInitialized(context);
	}
	videoRequested(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoRequested(context, detail);
	}
	videoBuffering(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoBuffering(context, detail);
	}
	videoCanPlay(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		if (this.isEnabled()) this.notifyVideoCanPlay(context, detail);
	}
	videoPlaying(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoPlaying(context, detail);
	}
	videoProgressed(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoProgressed(context, detail);
	}
	videoCompleted(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoCompleted(context, detail);
	}
	videoError(context: ItemContextProperty, detail: IVideoErrorTrackingEventDetail): void {
		if (this.isEnabled()) this.notifyVideoError(context, detail);
	}
	videoActioned(context: ItemContextProperty, detail: IVideoActionTrackingEventDetail): void {
		if (this.isEnabled()) this.notifyVideoActioned(context, detail);
	}
	videoPaused(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoPaused(context, detail);
	}
	videoResumed(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoResumed(context, detail);
	}
	videoSeeked(context: ItemContextProperty, detail: IVideoEventDetail): void {
		if (this.isEnabled()) this.notifyVideoSeeked(context, detail);
	}
	videoRestarted(context: ItemContextProperty): void {
		if (this.isEnabled()) this.notifyVideoRestarted(context);
	}
	videoChainplayed(context: ItemContextProperty, detail: IVideoTrackingEventDetail): void {
		if (this.isEnabled()) this.notifyVideoChainplayed(context, detail);
	}
	videoAdStarted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		if (this.isEnabled()) this.notifyVideoAdStarted(context, detail);
	}
	videoAdCompleted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		if (this.isEnabled()) this.notifyVideoAdCompleted(context, detail);
	}
	videoAdSkipped(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		if (this.isEnabled()) this.notifyVideoAdSkipped(context, detail);
	}
	protected notifyVideoInitialized(context: ItemContextProperty): void {}
	protected notifyVideoRequested(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoBuffering(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoCanPlay(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {}
	protected notifyVideoPlaying(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoProgressed(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoCompleted(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoError(context: ItemContextProperty, detail: IVideoErrorTrackingEventDetail): void {}
	protected notifyVideoActioned(context: ItemContextProperty, detail: IVideoActionTrackingEventDetail): void {}
	protected notifyVideoPaused(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoResumed(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoSeeked(context: ItemContextProperty, detail: IVideoEventDetail): void {}
	protected notifyVideoRestarted(context: ItemContextProperty): void {}
	protected notifyVideoChainplayed(context: ItemContextProperty, detail: IVideoTrackingEventDetail): void {}
	protected notifyVideoAdStarted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {}
	protected notifyVideoAdCompleted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {}
	protected notifyVideoAdSkipped(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {}
}

interface ILogger {
	error(message?: any, ...optionalParams: any[]): void;
	log(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
}

class EmptyLogger implements ILogger {
	error(message?: any, ...optionalParams: any[]): void {}
	log(message?: any, ...optionalParams: any[]): void {}
	warn(message?: any, ...optionalParams: any[]): void {}
}
