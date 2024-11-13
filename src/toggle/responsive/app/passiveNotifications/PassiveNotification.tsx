import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';
import CloseCross from 'ref/responsive/component/CloseCross';

import './PassiveNotification.scss';

interface PassiveNofiticationProps {
	config: PassiveNotificationConfig;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onClose?: () => void;
	hidden?: boolean;
	onRef?: (node: any) => void;
}

const bem = new Bem('passive-notification');

// very simple component for now, creating as a placehodler in case it gets more complicated
// doing such thing as auto intl formattering
export default function PassiveNotification(props: PassiveNofiticationProps) {
	const { config, hidden, onRef, onMouseEnter, onMouseLeave, onClose } = props;
	const className = config && config.className ? config.className : '';

	return (
		<div
			className={cx(bem.b(hidden ? 'hidden' : undefined), className)}
			ref={onRef}
			onMouseEnter={onMouseEnter || noop}
			onMouseLeave={onMouseLeave || noop}
		>
			{config && config.content}
			{onClose && <CloseCross className={bem.e('close-btn')} onClick={onClose} height={12} width={12} />}
		</div>
	);
}
