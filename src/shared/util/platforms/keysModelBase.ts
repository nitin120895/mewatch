export default class KeysModelBase {
	static Enter = 13;

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

	static Menu = 123; // F12
	static Back = 27; // Esc
	static Exit = 115; // F4
	static Delete = 46; // Delete

	static imeKeys: any = undefined;

	static MouseActive = undefined;
	static MouseQuiet = undefined;

	static mapKeys(keyCode: number) {
		return keyCode;
	}
}
