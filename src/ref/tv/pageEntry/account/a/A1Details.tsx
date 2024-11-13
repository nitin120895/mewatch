import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { InjectedIntl } from 'react-intl';
import { connect } from 'react-redux';
import EntryTitle from 'ref/tv/component/EntryTitle';
import { setPaddingStyle } from 'ref/tv/util/rows';
import { Account as accountPageKey } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { A1Details as template } from 'shared/page/pageEntryTemplate';
import sass from 'ref/tv/util/sass';
import './A1Details.scss';

const bem = new Bem('a1');

type A1DetailsProps = {
	config: state.Config;
};

class A1DetailsClass extends React.Component<PageEntryListProps & A1DetailsProps, any> {
	context: {
		intl: InjectedIntl;
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		intl: React.PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private accountPagePath;

	constructor(props) {
		super(props);

		this.accountPagePath = getPathByKey(accountPageKey, props.config);

		this.state = {
			isFocused: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: props.title ? sass.a1DetailHeight : sass.a1DetailLessHeight,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.setState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: skipMove
		};
	}

	componentDidMount() {
		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			isFocused: isFocus
		});

		return true;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	render() {
		const { config } = this.props;
		const accountLink =
			config.general.websiteUrl +
			(config.sitemapByTemplate ? config.sitemapByTemplate.Account['0'].path : this.accountPagePath);

		return (
			<div
				className={bem.b({ focused: this.state.isFocused })}
				ref={ref => (this.ref = ref)}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				<EntryTitle {...this.props} />
				<div className={bem.e('content')}>
					{this.context.intl.formatMessage({ id: 'a1_details_content' })}
					<b>{accountLink}</b>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): A1DetailsProps {
	return {
		config: state.app.config
	};
}

const A1Details = connect<A1DetailsProps, any, any>(
	mapStateToProps,
	undefined,
	undefined,
	{ withRef: true }
)(A1DetailsClass);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(A1Details as any).template = template;
export default A1Details;
