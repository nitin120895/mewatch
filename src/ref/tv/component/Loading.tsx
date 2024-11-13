import * as React from 'react';
import { Bem } from 'shared/util/styles';
import Spinner from './Spinner';
import './Loading.scss';

const bem = new Bem('app-loading');

interface LoadingProps extends React.Props<any> {
	show: boolean;
}

export default ({ show }: LoadingProps) => {
	return (
		<div className={bem.b({ show })}>
			<Spinner className={bem.e('spinner')} type={'common'} />
		</div>
	);
};
