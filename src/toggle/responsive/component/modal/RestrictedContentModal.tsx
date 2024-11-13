import * as React from 'react';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import RestrictedContentIcon from 'toggle/responsive/component/icons/RestrictedContentIcon';
import './RestrictedContentModal.scss';

const bem = new Bem('restricted-content-modal');

interface RestrictedContentModalProps {
	description: string;
	signedOut?: boolean;
	onSignIn?: () => void;
	onSignUp?: () => void;
	age?: number;
}

export function RestrictedContentModal({
	description,
	signedOut,
	onSignIn,
	onSignUp,
	age
}: RestrictedContentModalProps) {
	return (
		<div className={bem.e('wrapper')}>
			<RestrictedContentIcon className={bem.e('icon')} />
			<DialogTitle className={bem.e('title')}>
				{age ? '@{restricted_content|Restricted Content}' : '@{restricted_content_for_anonymous_title|Rated content.}'}
			</DialogTitle>
			<div className={bem.e('description')}>
				{age ? (
					<IntlFormatter values={{ age }}>{description}</IntlFormatter>
				) : (
					<IntlFormatter>{description}</IntlFormatter>
				)}
			</div>
			{signedOut && (
				<div className={bem.e('buttons')}>
					<CtaButton ordinal="primary" onClick={onSignIn} className={bem.e('button')}>
						<IntlFormatter>{'@{nav_signIn_label|Sign In}'}</IntlFormatter>
					</CtaButton>
					<CtaButton onClick={onSignUp} className={bem.e('button')}>
						<IntlFormatter>{'@{form_register_createAccount_label|Create Account}'}</IntlFormatter>
					</CtaButton>
				</div>
			)}
		</div>
	);
}
