import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { debounce } from 'shared/util/performance';

interface Props {
	className?: string;
	hasNextPage: boolean;
	loadNextPage: (pageNext: number, pagPrev?: number) => void;
	scrollContainer?: Element;
	scrollIndex: number;
	length: number;
	pageSize: number;
	height: number;
}

interface State {
	container: Element | Window;
	existPage: number[];
}

export const continuousScrollBem = new Bem('lazy-loading-scroll');

export default class LazyLoadingScrollingList extends React.Component<Props, State> {
	state = {
		container: window || undefined,
		existPage: []
	};

	componentDidMount() {
		const { length, pageSize, scrollIndex, loadNextPage } = this.props;
		this.state.container.addEventListener('scroll', this.scrollFinished, false);
		const maxPageSize = Math.round(length / pageSize);
		let currentPage = Math.floor((scrollIndex * maxPageSize) / length);
		currentPage = currentPage === 0 ? 1 : currentPage;
		loadNextPage(currentPage);
	}

	componentWillReceiveProps({ scrollContainer }: Props) {
		const { container } = this.state;
		const { scrollIndex, height } = this.props;
		if (scrollContainer && scrollContainer !== this.props.scrollContainer) {
			container.removeEventListener('scroll', this.scrollFinished, false);
			this.setState({ container: scrollContainer }, () => {
				this.state.container.addEventListener('scroll', this.scrollFinished, false);
				const scroll = scrollIndex * height;
				scrollContainer.scrollTo(0, scroll);
			});
		}
	}

	componentWillUnmount() {
		this.state.container.removeEventListener('scroll', this.scrollFinished, false);
	}

	render() {
		const { className, children } = this.props;
		return <div className={continuousScrollBem.b(className)}>{children}</div>;
	}

	scrollFinished = debounce(() => {
		const { pageSize, height, scrollContainer, loadNextPage } = this.props;
		const { existPage } = this.state;
		const node = (scrollContainer as any) as HTMLElement;
		const scrollPage = node.scrollTop / (height * pageSize) + 1;
		const next = Math.round(scrollPage);
		const needToLoadPrevPage = scrollPage % 1 >= 0.45 && next !== 1;

		if (existPage.indexOf(next) === -1) {
			const existPage = [...this.state.existPage, next];
			loadNextPage(next);
			this.setState({ existPage });
		}

		if (needToLoadPrevPage && existPage.indexOf(next - 1) === -1) {
			loadNextPage(next - 1);
			const existPage = [...this.state.existPage, next, next - 1];
			this.setState({ existPage });
		}
	}, 300);
}
