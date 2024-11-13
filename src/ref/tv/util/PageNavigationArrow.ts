import PageNavigationArrowComponent from '../component/PageNavigationArrow';

let pageNavigationArrow: PageNavigationArrowComponent;

const setup = (arrow: PageNavigationArrowComponent) => {
	pageNavigationArrow = arrow;
};

const show = (position?: string) => {
	if (pageNavigationArrow) {
		pageNavigationArrow.show(position);
	}
};

const hide = (position?: string) => {
	if (pageNavigationArrow) {
		pageNavigationArrow.hide(position);
	}
};

export const PageNavigationArrow = {
	setup: setup,
	show: show,
	hide: hide
};
