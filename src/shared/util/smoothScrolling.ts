const SmoothScrolling = {
	inProgress: false,

	stop: function() {
		this.inProgress = false;
	},

	scrollTo: function(id: string, duration = 1000, callback?: Function) {
		const node = document.getElementById(id);
		const nodeTop = node.offsetTop;
		const nodeHeight = node.offsetHeight;
		const body = document.body;
		const html = document.documentElement;
		const height = Math.max(
			body.scrollHeight,
			body.offsetHeight,
			html.clientHeight,
			html.scrollHeight,
			html.offsetHeight
		);
		const windowHeight = window.innerHeight;
		const offset = window.pageYOffset;
		const delta = nodeTop - offset;
		const bottomScrollableY = height - windowHeight;
		const targetY = bottomScrollableY < delta ? bottomScrollableY - (height - nodeTop - nodeHeight + offset) : delta;
		const startTime = Date.now();
		this.inProgress = true;

		function getScrollY(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
		}

		const step = () => {
			const elapsed = Date.now() - startTime;
			this.inProgress = this.inProgress && elapsed / duration < 1;

			if (this.inProgress) {
				const scrollY = getScrollY(elapsed, offset, targetY, duration);

				window.scrollTo(0, scrollY);
				window.requestAnimationFrame(step);
			} else {
				const scrollY = getScrollY(duration, offset, targetY, duration);

				window.scrollTo(0, scrollY);
				if (callback) callback();
			}
		};

		step();
	}
};

export default SmoothScrolling;
