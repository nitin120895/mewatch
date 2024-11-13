import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { FormattedMessage } from 'react-intl';
import { UnfocusableRow } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import EntryList from 'ref/tv/component/EntryList';
import sass from 'ref/tv/util/sass';
import './AccountHero.scss';

const bem = new Bem('account-hero');

export interface AccountHeroProps extends PageEntryListProps {
	profile: state.Profile;
	rowType: 'ah1' | 'ah2' | 'ah3';
}

export default class AccountHero extends React.Component<AccountHeroProps, any> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: UnfocusableRow;
	private ref: HTMLElement;

	constructor(props: AccountHeroProps) {
		super(props);
	}

	componentDidMount() {
		const { rowType, list, template } = this.props;

		if (rowType === 'ah3' || (list.paging.size !== -1 && list.items.length === 0)) {
			this.focusableRow = new UnfocusableRow(10);
			this.focusableRow.height = sass.ah3HeroHeight;
			this.focusableRow.ref = this.ref;
			this.focusableRow.template = template;
			this.focusableRow.entryProps = this.props;
			this.context.focusNav.registerRow(this.focusableRow);
		}
	}

	componentWillReceiveProps(nextProps: AccountHeroProps) {
		const { rowType, list, template, profile } = nextProps;
		const { focusNav } = this.context;

		if (this.props.profile === profile && this.props.list === list) return;

		if (rowType !== 'ah3' && list.paging.size !== -1) {
			if (list.items.length === 0) {
				this.focusableRow = new UnfocusableRow(10);
				this.focusableRow.height = sass.ah3HeroHeight;
				this.focusableRow.ref = this.ref;
				this.focusableRow.template = template;
				this.focusableRow.entryProps = nextProps;
				focusNav.registerRow(this.focusableRow);
				focusNav.resetFocus();
			} else {
				this.focusableRow && focusNav.unregisterRow(this.focusableRow);
			}
		}
	}

	componentWillUnmount() {
		this.focusableRow && this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private renderList = (type: string) => {
		let imageType, imageWidth, rowType, rowHeight;

		switch (type) {
			case 'ah1':
				imageType = 'poster';
				imageWidth = sass.posterImageWidth;
				rowType = 'p1';
				rowHeight = sass.ahHeroHeight;
				break;
			default:
				imageType = 'tile';
				imageWidth = sass.tileImageWidth;
				rowType = 't1';
				rowHeight = sass.ahHeroHeight;
				break;
		}

		return (
			<div
				className={bem.e('list')}
				style={{
					bottom:
						this.props.customFields && this.props.customFields.assetTitlePosition === 'below'
							? sass.ahPaddingBottom + sass.assetBelowTitleHeight
							: sass.ahPaddingBottom
				}}
			>
				<EntryList
					{...this.props}
					imageType={imageType}
					imageWidth={imageWidth}
					rowType={rowType}
					rowHeight={rowHeight}
					isUserList
				/>
			</div>
		);
	};

	private onRef = ref => {
		this.ref = ref;
	};

	render() {
		const { profile, rowType, list } = this.props;
		const name = profile && profile.info && profile.info.name;
		const isRenderList = rowType !== 'ah3' && list.items.length > 0;

		return (
			<div className={cx(bem.b({ isRenderList }), 'full-bleed')} ref={this.onRef}>
				{name && (
					<FormattedMessage id="account_hero_greeting" values={{ name }}>
						{value => <div className={bem.e('greeting')}>{value}</div>}
					</FormattedMessage>
				)}
				{isRenderList && this.renderList(rowType)}
			</div>
		);
	}
}
