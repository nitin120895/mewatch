import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import CloseIcon from '../../component/modal/CloseIcon';

import './PackageModal.scss';

interface Props {
	image?: string;
	description?: string;
	name?: string;
	onCancel: () => void;
}

const bem = new Bem('package-modal');

export default function PackageModal(props: Props) {
	const { description, name, image, onCancel } = props;
	return (
		<div className={bem.b()}>
			<div className={bem.e('close')} onClick={onCancel}>
				<CloseIcon />
			</div>
			<div className={bem.e('content')}>
				<img className={bem.e('image')} src={image} />
				<div className={bem.e('text')}>
					<div className={bem.e('title')}>{name}</div>
					<IntlFormatter tagName="div" className={bem.e('description')}>
						{description}
					</IntlFormatter>
				</div>
			</div>
		</div>
	);
}
