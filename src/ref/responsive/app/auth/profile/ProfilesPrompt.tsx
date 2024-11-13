import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import ProfileCircle from 'ref/responsive/component/ProfileCircle';

import './ProfilesPrompt.scss';

const bem = new Bem('selector');

interface SelectorInterface {
	account: api.Account;
	enabled: boolean;
	hid: string;
	onProfileSelect: (profile: api.ProfileSummary) => void;
	selectedProfile: api.ProfileSummary;
	showPin: boolean;
}

function renderProfileButton(key, profile, disabled, loading, isPrimary, onProfileSelect, focus) {
	return (
		<li key={key} className={bem.e('item')} role="menuitemradio">
			<ProfileCircle
				focusOnUpdate={focus}
				large
				profile={profile}
				disabled={disabled}
				loading={loading}
				isPrimary={isPrimary}
				onSelect={onProfileSelect}
				className={bem.e('circle')}
			/>
		</li>
	);
}

export default function Selector({
	account,
	enabled,
	hid,
	onProfileSelect,
	selectedProfile,
	showPin
}: SelectorInterface) {
	if (!account) return <div />;
	const { profiles } = account;
	let id;
	if (selectedProfile) id = selectedProfile.id;
	const numProfiles = enabled ? profiles.length : 0;
	return (
		<div className={bem.b()}>
			<IntlFormatter id={hid} elementType="h1" className={bem.e('title')}>
				{"@{profileSelector_title|Who's Watching?}"}
			</IntlFormatter>
			<IntlFormatter
				elementType="ul"
				className={cx(bem.e('items'), { 'txt-left': numProfiles > 2 })}
				role="menu"
				formattedProps={{ 'aria-label': '@{profileSelector_desc_aria|Choose your profile.}' }}
			>
				{enabled &&
					profiles.map((p, i) => {
						const disabled = id && id !== p.id && !selectedProfile.isRestricted;
						const loading = id === p.id && !selectedProfile.isRestricted;
						const isPrimary = account.primaryProfileId === p.id;
						const focus = i === 0 && !showPin;
						return renderProfileButton(p.id, p, disabled, loading, isPrimary, onProfileSelect, focus);
					})}
			</IntlFormatter>
		</div>
	);
}
