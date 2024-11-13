import * as React from 'react';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import './PrimaryNav.scss';

interface PrimaryNavProps extends React.HTMLProps<any> {
	entries: api.NavEntry[];
	listCache: any;
	strings?: { [id: string]: string };
	entryChanged: (path: string) => void;
	onClickNavLink: (index: number) => void;
	updateEntries: (entriesCount: number) => void;
}

interface PrimaryNavState {
	curEntryIndex: number;
}

const bem = new Bem('primary-nav');

export default class PrimaryNav extends React.Component<PrimaryNavProps, PrimaryNavState> {
	private ref: HTMLElement;

	constructor(props) {
		super(props);

		this.state = {
			curEntryIndex: 0
		};
	}

	componentDidMount() {
		if (this.ref && this.ref.offsetWidth > 0 && this.ref.offsetWidth < this.ref.scrollWidth) {
			this.props.updateEntries(this.props.entries.length - 1);
		}
	}

	componentDidUpdate() {
		if (this.ref && this.ref.offsetWidth > 0 && this.ref.offsetWidth < this.ref.scrollWidth) {
			this.props.updateEntries(this.props.entries.length - 1);
		}
	}

	setCurEntryIndex = (index: number) => {
		this.setState({ curEntryIndex: index });
	};

	getCurEntryIndex = () => {
		return this.state.curEntryIndex;
	};

	moveLeft() {
		const curEntryIndex = this.state.curEntryIndex;
		const { entries, entryChanged } = this.props;

		if (curEntryIndex === 0) {
			return false;
		}

		let tarIndex = curEntryIndex - 1;

		while (tarIndex >= 0 && !entries[tarIndex].path) {
			tarIndex--;
		}

		if (tarIndex >= 0) {
			if (entryChanged) {
				entryChanged(entries[tarIndex].path);
			}

			this.setState({ curEntryIndex: tarIndex });
			return true;
		} else {
			return false;
		}
	}

	moveRight() {
		const { entries, entryChanged } = this.props;
		const curEntryIndex = this.state.curEntryIndex;

		if (curEntryIndex === entries.length - 1) {
			return false;
		}

		let tarIndex = curEntryIndex + 1;

		while (tarIndex < entries.length && !entries[tarIndex].path) {
			tarIndex++;
		}

		if (tarIndex < entries.length) {
			if (entryChanged) {
				entryChanged(entries[tarIndex].path);
			}

			this.setState({ curEntryIndex: tarIndex });
			return true;
		}

		return false;
	}

	private handleClick = (e, index) => {
		e.preventDefault();
		this.setCurEntryIndex(index);
		this.props.onClickNavLink(index);
	};

	private onRef = ref => {
		this.ref = ref;
	};

	render() {
		const { entries, className, strings } = this.props;
		const classes = cx(bem.b(), className);
		const allEntries = entries;

		return (
			<div className={classes} aria-label={strings['nav_primary_aria']} role="navigation" ref={this.onRef}>
				{allEntries.map(this.renderEntry)}
			</div>
		);
	}

	renderEntry = (entry: api.NavEntry, index: number): any => {
		const curEntryIndex = this.state.curEntryIndex;
		const classes = bem.e('entry', {
			active: index === curEntryIndex
		});

		if (!entry.path) {
			return '';
		}

		return (
			<div key={index} className={classes} tabIndex={0}>
				{this.renderEntryLink(entry, index)}
			</div>
		);
	};

	private renderEntryLink(entry: api.NavEntry, index: number): any {
		const { label, path } = entry;
		const classes = bem.e('entry-link');

		return (
			<Link className={classes} to={path} onClick={e => this.handleClick(e, index)}>
				{label}
			</Link>
		);
	}
}
