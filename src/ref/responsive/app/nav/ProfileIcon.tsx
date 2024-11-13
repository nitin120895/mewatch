import * as React from 'react';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import { getFirstCharacter } from 'shared/util/strings';

import './ProfileIcon.scss';

interface ProfileIconProps extends React.HTMLProps<any> {
	profile?: api.ProfileSummary;
	linkPath?: string;
	includeName?: boolean;
}

const bem = new Bem('profile-icon');

export default class ProfileIcon extends React.Component<ProfileIconProps, any> {
	private circle: HTMLElement;
	private mounted = false;

	componentDidMount() {
		this.mounted = true;
		this.updateColor(this.props);
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.profile !== this.props.profile) {
			this.updateColor(nextProps);
		}
	}

	private updateColor({ profile }: ProfileIconProps) {
		if (!this.mounted || !this.circle) return;
		this.circle.style.backgroundColor = profile.color || undefined;
	}

	private onCircleReference = (element: HTMLElement) => {
		this.circle = element;
		this.updateColor(this.props);
	};

	render() {
		const { className, profile, linkPath, onClick } = this.props;
		const ariaLabel = `@{nav_viewProfile_aria|View profile} ${profile.name}`;
		const classes = cx(bem.b(), className);
		if (linkPath) {
			return (
				<IntlFormatter
					elementType={Link}
					className={classes}
					onClick={onClick}
					componentProps={{ to: linkPath }}
					formattedProps={{ 'aria-label': ariaLabel }}
				>
					{this.renderBody()}
				</IntlFormatter>
			);
		}
		const disabled = !onClick;
		return (
			<IntlFormatter
				elementType="button"
				className={classes}
				onClick={onClick}
				disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				role={disabled ? 'presentation' : undefined}
				formattedProps={{ 'aria-label': ariaLabel }}
			>
				{this.renderBody()}
			</IntlFormatter>
		);
	}

	renderBody(): any {
		return [this.renderCircle(), this.renderName()];
	}

	renderCircle(): any {
		const { profile } = this.props;
		if (!profile || !profile.name) return;
		const firstCharacter = getFirstCharacter(profile.name);
		return (
			<span key="circle" ref={this.onCircleReference} className={bem.e('circle')}>
				<span className={cx(bem.e('initial'), 'uppercase')}>{firstCharacter}</span>
			</span>
		);
	}

	renderName(): any {
		const { includeName, profile } = this.props;
		if (!includeName || !profile) return;

		return (
			<span key="name" className={cx(bem.e('name'), 'truncate')}>
				{profile.name}
			</span>
		);
	}
}
