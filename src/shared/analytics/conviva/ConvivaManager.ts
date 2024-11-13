/// <reference path="conviva-core-sdk.d.ts" />

import { ConvivaHtml5Http } from './ConvivaHtml5Http';
import { ConvivaHtml5Logging } from './ConvivaHtml5Logging';
import { ConvivaHtml5Metadata } from './ConvivaHtml5Metadata';
import { ConvivaHtml5Storage } from './ConvivaHtml5Storage';
import { ConvivaHtml5Time } from './ConvivaHtml5Time';
import { ConvivaHtml5Timer } from './ConvivaHtml5Timer';
import { ConvivaVideoAnalyticsMetadata } from './ConvivaVideoAnalyticsMetadata';

export class ConvivaManager {
	private customerKey: string;
	private gatewayUrl: string;
	private sessionKey: number = Conviva.Client.NO_SESSION_KEY;

	private _client: Conviva.Client = undefined;
	private _playerStateManager: Conviva.PlayerStateManager = undefined;
	private _systemFactory: Conviva.SystemFactory = undefined;

	constructor(customerKey: string, gatewayUrl: string) {
		this.customerKey = customerKey;
		this.gatewayUrl = gatewayUrl;
	}

	private initialize(): void {
		const systemInterface = new Conviva.SystemInterface(
			new ConvivaHtml5Time(),
			new ConvivaHtml5Timer(),
			new ConvivaHtml5Http(),
			new ConvivaHtml5Storage(),
			new ConvivaHtml5Metadata({ frameworkName: 'HTML5' }),
			new ConvivaHtml5Logging(console)
		);
		const systemSettings = new Conviva.SystemSettings();
		// enable detailed DEBUG logging
		systemSettings.logLevel = Conviva.SystemSettings.LogLevel.DEBUG;
		this._systemFactory = new Conviva.SystemFactory(systemInterface, systemSettings);

		const clientSettings = new Conviva.ClientSettings(this.customerKey);
		// gatewayUrl should be used only for testing, set it to '' to disable it
		if (this.gatewayUrl && this.gatewayUrl !== '') clientSettings.gatewayUrl = this.gatewayUrl;
		this._client = new Conviva.Client(clientSettings, this._systemFactory);

		this._playerStateManager = this._client.getPlayerStateManager();
	}

	private ensureClient() {
		if (!this.hasClient) this.initialize();
	}

	get client(): Conviva.Client {
		return this._client;
	}

	get playerStateManager(): Conviva.PlayerStateManager {
		return this._playerStateManager;
	}

	get hasActiveSession(): boolean {
		return this.sessionKey !== Conviva.Client.NO_SESSION_KEY;
	}

	get hasClient(): boolean {
		return this._client !== undefined;
	}

	get hasPlayerStateManager(): boolean {
		return this._playerStateManager !== undefined;
	}

	endSession(): void {
		if (!this.hasActiveSession) return;

		this._client.detachPlayer(this.sessionKey);
		this._client.releasePlayerStateManager(this._playerStateManager);
		this._playerStateManager = undefined;
		this._client.cleanupSession(this.sessionKey);
		this.sessionKey = Conviva.Client.NO_SESSION_KEY;
	}

	startSession(metadata: ConvivaVideoAnalyticsMetadata): void {
		if (this.hasActiveSession) return;

		this.ensureClient();

		this.sessionKey = this._client.createSession(metadata.contentMetadata);

		if (!this.hasPlayerStateManager) this._playerStateManager = this._client.getPlayerStateManager();

		this._playerStateManager.setStreamUrl(metadata.contentMetadata.streamUrl);
		this._playerStateManager.setPlayerType(metadata.getPlayerVendor());
		this._playerStateManager.setPlayerState(metadata.playerState);

		this._client.attachPlayer(this.sessionKey, this._playerStateManager);
	}

	updatePlayerStateManagerFromMetadata(metadata: ConvivaVideoAnalyticsMetadata): void {
		if (!this.hasPlayerStateManager) return;

		if (metadata.hasVideoBitrate) this._playerStateManager.setBitrateKbps(metadata.videoBitrate);

		if (metadata.hasVideoDuration && !metadata.wasVideoDurationSet) {
			metadata.wasVideoDurationSet = true;
			this._playerStateManager.setDuration(metadata.videoDuration);
		}

		if (this._playerStateManager.getPlayerState() !== metadata.playerState)
			this._playerStateManager.setPlayerState(metadata.playerState);
	}

	sendError(message: string, isFatal: boolean): void {
		if (!this.hasPlayerStateManager) return;

		this._playerStateManager.sendError(
			message,
			isFatal ? Conviva.Client.ErrorSeverity.FATAL : Conviva.Client.ErrorSeverity.WARNING
		);
	}

	protected adStartAt(position: Conviva.Client.AdPosition): void {
		this._client.adStart(this.sessionKey, Conviva.Client.AdStream.SEPARATE, Conviva.Client.AdPlayer.SEPARATE, position);
		this._client.detachPlayer(this.sessionKey);
	}

	adStart(metadata: ConvivaVideoAnalyticsMetadata): void {
		if (metadata.wasPlayingState) this.adStartAtMidRoll();
		else this.adStartAtPreRoll();
	}

	adStartAtMidRoll(): void {
		this.adStartAt(Conviva.Client.AdPosition.MIDROLL);
	}

	adStartAtPreRoll(): void {
		this.adStartAt(Conviva.Client.AdPosition.PREROLL);
	}

	adEnd(): void {
		this._client.attachPlayer(this.sessionKey, this._playerStateManager);
		this._client.adEnd(this.sessionKey);
	}

	dispose(): void {
		this.endSession();

		if (this.hasClient) {
			this._client.release();
			this._client = undefined;
			this._systemFactory.release();
			this._systemFactory = undefined;
		}
	}
}
