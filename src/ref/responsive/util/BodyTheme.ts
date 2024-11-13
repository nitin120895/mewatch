class BodyTheme {
	private body: Element;
	private currentTheme: AppTheme;

	constructor() {
		if (!_SSR_) {
			this.body = document.querySelector('body');
		}
	}

	set(theme: AppTheme) {
		this.remove(this.currentTheme);
		this.currentTheme = theme;
		if (this.body) this.body.classList.add(theme);
	}

	private remove(theme: AppTheme) {
		if (this.body) this.body.classList.remove(theme);
	}
}

export default BodyTheme;
