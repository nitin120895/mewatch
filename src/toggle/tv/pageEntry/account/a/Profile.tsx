import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/tv/component/IntlFormatter';
import './Profile.scss';

const lockImg = require('../../../../../../resource/ref/tv/image/lock.png');

interface ProfileProps extends React.HTMLProps<any> {
	profile: api.ProfileSummary;
	focused: boolean;
	locked?: boolean;
	index?: number;
	mouseEnter?: (index: number) => void;
	mouseLeave?: () => void;
	mouseClick?: (act?: string, index?: number) => void;
}

const bem = new Bem('profile');

export default class Profile extends React.Component<ProfileProps, any> {
	private profile?: api.ProfileSummary;

	constructor(props) {
		super(props);

		this.profile = props.profile;
	}

	private handleMouseEnter = () => {
		const { index, mouseEnter } = this.props;
		mouseEnter && mouseEnter(index);
	};

	private handleMouseLeave = () => {
		this.props.mouseLeave && this.props.mouseLeave();
	};

	private handleMouseClick = () => {
		const { index, mouseClick } = this.props;
		mouseClick && mouseClick('click', index);
	};

	render(): any {
		const { profile, focused, locked } = this.props;
		const profileName = profile ? profile.name : '';
		return (
			<div
				className={bem.b()}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				onClick={this.handleMouseClick}
			>
				{profile && (
					<div className={bem.e('initial', { focused })} style={{ backgroundColor: (profile as any).color }}>
						{profile.name.charAt(0)}
						<img
							className={bem.e('lock', { show: locked === undefined ? this.profile.isRestricted : locked })}
							src={lockImg}
						/>
					</div>
				)}
				{!profile && (
					<div className={bem.e('initial', { focused, new: true })}>
						<span className={bem.e('new-mark')} />
					</div>
				)}
				{profileName && <div className={bem.e('name', { focused })}>{profileName}</div>}
				{!profileName && (
					<IntlFormatter tagName="div" className={bem.e('name', { focused })}>
						{`@{create_profile|Create New}`}
					</IntlFormatter>
				)}
			</div>
		);
	}
}
