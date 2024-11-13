/**
 * Because this component is for demonstration purposes only this component has not been setup for International
 * support.
 */
import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import AccountEntryWrapper from '../common/AccountEntryWrapper';
import TextInput from 'ref/responsive/component/input/TextInput';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CtaButton from '../../../component/CtaButton';
import { setSegments } from 'shared/account/accountWorkflow';
import { A99Segments as template } from 'shared/page/pageEntryTemplate';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { CancelablePromise, makeCancelable } from 'shared/util/promises';
import warning from 'shared/util/warning';

import './A99Segments.scss';

const bem = new Bem('a99');

interface A99SegmentsState {
	locked: boolean;
	tags: string;
	prevTags: string;
	inputState: form.DisplayState;
	error: string;
}

interface A99SegmentsProps extends PageEntryPropsBase {
	account?: api.Account;
	setSegments?: (segments: { segments: string[] }) => Promise<any>;
}

class A99Segments extends React.Component<A99SegmentsProps, A99SegmentsState> {
	private cancelablePromise: CancelablePromise<any>;

	static defaultProps = {
		account: {
			segments: ['']
		}
	};

	constructor(props) {
		super(props);
		const segments = props.account.segments;
		this.state = {
			locked: true,
			tags: arrayToString(segments),
			prevTags: '',
			inputState: 'default',
			error: undefined
		};
	}

	componentWillUnmount() {
		if (!!this.cancelablePromise) this.cancelablePromise.cancel();
	}

	private lock = () => this.setState({ locked: true });

	private unlock = e => {
		this.setState({
			locked: false,
			prevTags: this.state.tags
		});
	};

	private onSubmit = e => {
		e.preventDefault();
		const { tags } = this.state;
		const { setSegments } = this.props;
		const segments = this.filterSegments(tags);
		this.setState({ tags: arrayToString(segments) });

		this.cancelablePromise = makeCancelable(setSegments({ segments }));
		this.cancelablePromise.promise
			.then(res => {
				if (res && res.error) {
					this.setState({
						inputState: 'error',
						error: 'An error has occurred while trying to save. Please try again.'
					});
				} else {
					this.lock();
				}
			})
			.catch(reason => warning('Promise is canceled'));
	};

	private onCancel = e => {
		e.preventDefault();
		this.setState({ tags: this.state.prevTags });
		this.lock();
	};

	private onChange = e => {
		this.setState({ tags: e.target.value });
	};

	private filterSegments = tags => {
		tags = tags
			.replace(/[^A-Za-z0-9_,]/gi, '')
			.toLowerCase()
			.split(',')
			.filter(tag => !!tag);
		return Array.from(new Set(tags)) as Array<any>;
	};

	render() {
		const { locked } = this.state;
		return (
			<div className={cx('form-white', bem.b())}>
				<AccountEntryWrapper
					buttonLabel={'@{account_common_row_button_label|Edit}'}
					onClick={locked ? this.unlock : undefined}
					{...this.props}
				>
					{(!locked && this.renderUnlocked()) || this.renderLocked()}
				</AccountEntryWrapper>
			</div>
		);
	}

	private renderLocked() {
		const { tags } = this.state;
		if (tags.length === 0)
			return (
				<p className={bem.e('instructions')}>Apply segmentation tags to this account for demonstration purposes</p>
			);
		else {
			return this.filterSegments(tags).map(tag => {
				if (tag.length > 0)
					return (
						<div key={tag} className={bem.e('tag')}>
							{tag}
						</div>
					);
			});
		}
	}

	private renderUnlocked() {
		const { tags, inputState, error } = this.state;
		return (
			<form onSubmit={this.onSubmit}>
				<TextInput
					displayState={inputState}
					id="segment-tags"
					label={'Segmentation Tags'}
					name="segment-tags"
					onChange={this.onChange}
					message={inputState === 'error' ? error : '(Comma separated)'}
					required={false}
					value={tags}
					focus={tags.length === 0}
				/>
				<div className={bem.e('buttons')}>
					<IntlFormatter elementType={AccountButton} componentProps={{ type: 'submit' }}>
						{'@{account_common_save_button_label|Save}'}
					</IntlFormatter>
					<IntlFormatter
						elementType={CtaButton}
						componentProps={{ ordinal: 'naked', theme: 'light' }}
						onClick={this.onCancel}
					>
						{'@{account_common_cancel_button_label|Cancel}'}
					</IntlFormatter>
				</div>
			</form>
		);
	}
}

function arrayToString(array) {
	return (array || []).join(', ');
}

function mapDispatchToProps(dispatch) {
	return {
		setSegments: (segments: string[]) => dispatch(setSegments(segments))
	};
}

const Component: any = connect<any, any, PageEntryListProps>(
	undefined,
	mapDispatchToProps
)(A99Segments);
Component.template = template;

export default Component;
