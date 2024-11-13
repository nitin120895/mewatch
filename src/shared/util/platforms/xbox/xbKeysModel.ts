import KeysModelBase from '../keysModelBase';

export default class SubKeysModel extends KeysModelBase {
	static AButton = 195;
	static BButton = 196;
	static XButton = 197;
	static YButton = 198;

	static RB = 199;
	static LB = 200;
	static LT = 201;
	static RT = 202;

	static Left = 205;
	static Up = 203;
	static Right = 206;
	static Down = 204;

	static XBMenu = 207;
	static XBToggle = 208;

	static LeftStickTap = 209;
	static RightStickTap = 210;
	static LeftStickUp = 211;
	static LeftStickDown = 212;
	static LeftStickRight = 213;
	static LeftStickLeft = 214;
	static RightStickUp = 215;
	static RightStickDown = 216;
	static RightStickRight = 217;
	static RightStickLeft = 218;

	// mapped keys
	static Enter = 195; // A Button
	static Back = 196; // Back
	static Delete = 197; // Button X
	static Menu = 197; // Button X

	static imeKeys = {};

	static mapKeys(keyCode: number) {
		switch (keyCode) {
			case this.LeftStickUp:
				return this.Up;
			case this.LeftStickDown:
				return this.Down;
			case this.LeftStickRight:
				return this.Right;
			case this.LeftStickLeft:
				return this.Left;
			default:
				return keyCode;
		}
	}
}
