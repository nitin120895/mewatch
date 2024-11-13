import KeysModelBase from '../keysModelBase';

if (typeof window !== 'undefined' && (window as any).tizen) {
	const tizen = (window as any).tizen;
	const tryRegisterKey = (id: string) => {
		try {
			tizen.tvinputdevice.registerKey(id);
		} catch (err) {
			console.log('Unable to register key:', id, err);
		}
	};
	(window as any).setImmediate(() => {
		tryRegisterKey('MediaPlayPause');
		tryRegisterKey('MediaPlay');
		tryRegisterKey('MediaStop');
		tryRegisterKey('MediaPause');
		tryRegisterKey('MediaRewind');
		tryRegisterKey('MediaFastForward');
		tryRegisterKey('0');
		tryRegisterKey('1');
		tryRegisterKey('2');
		tryRegisterKey('3');
		tryRegisterKey('4');
		tryRegisterKey('5');
		tryRegisterKey('6');
		tryRegisterKey('7');
		tryRegisterKey('8');
		tryRegisterKey('9');
		tryRegisterKey('Info');
		// tryRegisterKey('Back');
		tryRegisterKey('Exit');
	});
}

export default class SubKeysModel extends KeysModelBase {
	static Enter = 13;

	static Pause = 19; // MediaPause

	static Left = 37;
	static Up = 38;
	static Right = 39;
	static Down = 40;

	static Number0 = 48;
	static Number1 = 49;
	static Number2 = 50;
	static Number3 = 51;
	static Number4 = 52;
	static Number5 = 53;
	static Number6 = 54;
	static Number7 = 55;
	static Number8 = 56;
	static Number9 = 57;

	static Red = 403;
	static Green = 404;
	static Yellow = 405;
	static Blue = 406;

	static Rewind = 412;
	static Stop = 413;
	static Play = 415;
	static Record = 416;
	static FastForward = 417;
	static ChannelDown = 427;
	static ChannelUp = 428;
	static VolumeUp = 447;
	static VolumeDown = 448;
	static VolumeMute = 449;

	static Menu = 457; // Info
	static Back = 10009;
	static SmartHub = 10071;
	static Source = 10072;
	static ChannelList = 10073;
	static Exit = 10182;
	static SkipBackward = 10232;
	static SkipForward = 10233;
	static Voice = 10224;
	static Search = 10225;
	static PlayPause = 10252;
	static Extra = 10253;

	static Delete = 406; // Blue / D

	static imeKeys = {
		// http://developer.samsung.com/tv/develop/guides/user-interaction/keyboardime
		DONE: 65376,
		CANCEL: 65385,
		DELETE: 8,
		DELETE_ALL: 46,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		SPACE: 32,
		OTHER_KEYS: 229
	};
}
