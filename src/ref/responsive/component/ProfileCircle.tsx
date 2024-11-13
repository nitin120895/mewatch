import * as React from 'react';
import LockIcon from 'ref/responsive/component/icons/LockIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { AccountProfileEdit as profileEditKey, AccountProfileAdd as profileAddKey } from 'shared/page/pageKey';
import Link from 'shared/component/Link';
import Spinner from 'ref/responsive/component/Spinner';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { isKidsProfile as checkKids } from 'ref/responsive/util/kids';
import { getFirstCharacter } from 'shared/util/strings';

import './ProfileCircle.scss';

const bem = new Bem('profile-circle');

interface ProfileCircleProps extends React.Props<PageEntryPropsBase> {
	profile?: api.ProfileSummary;
	onSelect?: (profile: api.ProfileSummary) => void;
	loading?: boolean;
	disabled?: boolean;
	isPrimary: boolean;
	large?: boolean;
	displayByline?: boolean;
	type?: 'button' | 'link';
	className?: string;
	primaryDisabled?: boolean;
	focusOnUpdate?: boolean;
}

interface ProfileCircleState {
	backgroundColor?: string;
}

export default class ProfileCircle extends React.Component<ProfileCircleProps, any> {
	static defaultProps = {
		displayByline: false,
		type: 'button',
		primaryDisabled: false,
		focus: true
	};
	state: ProfileCircleState = {
		backgroundColor: undefined
	};
	private node: HTMLButtonElement;

	componentDidMount() {
		this.setState({ backgroundColor: this.props.profile.color });
		this.focus();
	}

	componentWillReceiveProps(nextProps) {
		const { profile } = this.props;
		const { profile: newProfile } = nextProps;
		if (newProfile !== profile || newProfile.color !== this.state.backgroundColor) {
			this.setState({ backgroundColor: newProfile.color });
		}
	}

	componentDidUpdate(prevProps) {
		const { focusOnUpdate } = this.props;
		if (focusOnUpdate !== prevProps.focusOnUpdate && focusOnUpdate) this.focus();
	}

	private focus() {
		const { node } = this;
		if (node && this.props.focusOnUpdate) node.focus();
	}

	private onClick = e => {
		e.preventDefault();
		if (this.props.onSelect) this.props.onSelect(this.props.profile);
	};

	private onRef = node => (this.node = node);

	render() {
		const { profile, large, disabled, className, type, isPrimary, primaryDisabled } = this.props;
		let Component;
		let props;
		if (primaryDisabled && isPrimary) Component = 'div';
		else if (type === 'button') {
			Component = 'button';
			props = {
				onClick: this.onClick,
				ref: this.onRef
			};
		} else {
			Component = Link;
			props = {
				onClick: this.onClick,
				to: `@${profileEditKey}?id=${profile.id}`
			};
		}
		return (
			<Component className={cx(bem.b({ large }), className)} {...props}>
				<div>
					{this.renderCircleBody()}
					<div className={bem.e('details')}>
						<p className={cx(bem.e('label', 'name', { disabled }), 'truncate')}>
							{type === 'link' && !isPrimary ? (
								<IntlFormatter className={'sr-only'}>{`@{profileCircle_action|Change}`}</IntlFormatter>
							) : (
								''
							)}
							{profile.name}
						</p>
						{this.renderByline()}
					</div>
				</div>
			</Component>
		);
	}

	private renderByline() {
		const { isPrimary, profile, displayByline } = this.props;
		let isKids;
		let needsLabel = false;
		if (displayByline) {
			isKids = checkKids(profile.segments);
			needsLabel = isKids || isPrimary;
		}
		if (!needsLabel) return <br />;
		const label = isKids ? `@{account_a4_profile_type_kid|Kids}` : `@{account_a4_profile_type_primary|Primary}`;
		return (
			<IntlFormatter elementType="p" className={bem.e('label', 'type')}>
				{label}
			</IntlFormatter>
		);
	}

	private renderCircleBody() {
		const { isPrimary, profile, loading, primaryDisabled } = this.props;
		const { backgroundColor } = this.state;
		let { disabled } = this.props;
		disabled = disabled || (primaryDisabled && isPrimary);
		if (loading) {
			return (
				<div style={{ backgroundColor }} className={bem.e('circle', { loading })}>
					<Spinner className={bem.e('spinner')} />
				</div>
			);
		}

		const firstCharacter = getFirstCharacter(profile.name);

		return (
			<div style={{ backgroundColor }} className={bem.e('circle', { disabled })}>
				<div className={bem.e('letter')} aria-hidden={true}>
					{firstCharacter}
				</div>
				{profile.isRestricted && (
					<div className={bem.e('lock')} aria-hidden={true}>
						<LockIcon />
					</div>
				)}
			</div>
		);
	}
}

export function NewProfile(props) {
	return (
		<Link to={`@${profileAddKey}`} className={cx(props.className, bem.b('new-profile'))}>
			<div className={cx(bem.e('circle'))}>
				<div className={bem.e('plus')} />
			</div>
			<IntlFormatter elementType="p" className={bem.e('label')}>
				{`@{account_a4_newProfile_button_label|Add Profile}`}
			</IntlFormatter>
			{/* Dodgy 'second' line to ensure it lines up with others */}
			<br />
		</Link>
	);
}
