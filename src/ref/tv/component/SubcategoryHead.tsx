import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { selectPageState } from 'shared/page/pageUtil';
import TitledListModal from './modal/TitledListModal';
import * as cx from 'classnames';

import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { skipMove, focusedClass } from 'ref/tv/util/focusUtil';
import { H10Text, H11PageTitle } from 'shared/page/pageEntryTemplate';
import './SubcategoryHead.scss';

import { FormattedMessage } from 'react-intl';

interface SubcategoryHeadProps extends PageEntryPropsBase {
	title: string;
}

const bem = new Bem('subcategory-head');

/**
 * Subcategory Head component
 *
 * Use this as the top head component in subcategory page
 */
interface SubcategoryHeadProps extends React.Props<any> {
	entries?: api.ItemList[];
	title: string;
	hasTitleRow?: boolean;
	showJumpTo?: boolean;
	onItemClicked?: (index: number) => void;
}

interface SubcategoryHeadState {
	focused?: boolean;
}

class SubcategoryHead extends React.PureComponent<SubcategoryHeadProps, SubcategoryHeadState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref;

	constructor(props) {
		super(props);
		this.state = {
			focused: false
		};

		this.focusableRow = {
			focusable: true,
			index: -9,
			height: 1,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: skipMove,
			moveRight: skipMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
	}

	componentDidMount() {
		if (this.props.showJumpTo) this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillReceiveProps(nextProps: SubcategoryHeadProps) {
		if (nextProps.showJumpTo !== this.props.showJumpTo) {
			if (nextProps.showJumpTo) {
				this.context.focusNav.registerRow(this.focusableRow);
			} else {
				this.context.focusNav.unregisterRow(this.focusableRow);
			}
		}
	}

	componentWillUnmount() {
		if (this.props.showJumpTo) this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentDidUpdate() {
		if (this.props.showJumpTo) {
			this.focusableRow.savedState = Object.assign({}, this.state);

			if (!this.props.hasTitleRow && this.props.showJumpTo) {
				this.focusableRow.height = this.ref && this.ref.clientHeight;
			}
		}
	}

	private setFocus = (isFocused?: boolean): boolean => {
		this.setState({
			focused: isFocused
		});
		return true;
	};

	private exec = (act?: string) => {
		switch (act) {
			case 'esc':
				this.context.focusNav.hideDialog();
				break;

			case 'click':
				this.onClickJumpto();
				return true;

			default:
				break;
		}

		return false;
	};

	private onItemClicked = (index: number) => {
		// index + 1 for global header, index + 2 for the title.
		let rowIndex = (index + 2) * 10;
		this.context.focusNav.hideDialog();
		this.context.focusNav.moveToRow(rowIndex);
	};

	private onClickJumpto = () => {
		const { title, entries } = this.props;

		const onRef = ref => {
			if (ref) {
				this.context.focusNav.setFocus(ref.focusableRow);
			}
		};

		this.context.focusNav.showDialog(
			<TitledListModal
				title={title}
				entries={entries.map(e => {
					return { label: e.title, key: e.key };
				})}
				onItemClicked={this.onItemClicked}
				ref={onRef}
			/>
		);
	};

	private onRef = ref => {
		this.ref = ref;
	};

	render() {
		const { title, hasTitleRow, showJumpTo } = this.props;

		return (
			<div className={bem.b({ hasTitleRow })} ref={this.onRef}>
				<div className={bem.e('title')}>{title}</div>
				<FormattedMessage id="jump_to">
					{value => (
						<div className={bem.e('jumpto', { showJumpTo })}>
							<button className={cx('brand__btn', this.state.focused ? focusedClass : '')} onClick={this.onClickJumpto}>
								{value}
							</button>
						</div>
					)}
				</FormattedMessage>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): SubcategoryHeadProps {
	try {
		const { cache, page } = state;
		const currentPath = page.history.location.pathname;

		const title = page.history.pageSummary.title;
		const pageData = cache.page[currentPath];

		let hasTitleRow = false;

		// filter Title row
		const entries: any[] = pageData['entries'];
		let newEntries = entries;

		if (entries && entries.length > 0) {
			// We assume if Title row like H10 or H11 exists, it must be the first one in the entries
			const firstRow = entries[0];

			if (firstRow.template === H10Text || firstRow.template === H11PageTitle) {
				hasTitleRow = true;

				newEntries = entries.slice(1);
			}
		}

		// check if need show JumpTo button, only 'Movies a-z, movies genres, tv a-z and tv genres' need show it
		let showJumpTo = false;
		const pageKey = pageData.key;
		switch (pageKey) {
			case 'MoviesAZ':
			case 'MoviesGenres':
			case 'TVGenres':
			case 'TVAZ':
				showJumpTo = true;
				break;

			default:
				break;
		}

		return {
			id: pageData.id,
			entries: newEntries,
			title,
			hasTitleRow,
			showJumpTo,
			template: pageData.template,
			savedState: selectPageState(state)
		};
	} catch (e) {
		return {
			id: '1',
			entries: [],
			title: undefined,
			hasTitleRow: false,
			showJumpTo: false,
			template: undefined,
			savedState: undefined
		};
	}
}

export default connect<any, any, SubcategoryHeadProps>(
	mapStateToProps,
	undefined,
	undefined,
	{ withRef: true }
)(SubcategoryHead);
