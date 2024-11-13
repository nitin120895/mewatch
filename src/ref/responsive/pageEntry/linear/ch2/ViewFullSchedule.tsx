import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { convertColorToBackgroundStyle } from '../common/utils';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { EPG } from 'shared/page/pageTemplate';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';

import './ViewFullSchedule.scss';

interface ViewFullScheduleProps {
	path: string;
	color?: api.ThemeColor;
	config?: state.Config;
	className?: string;
}

const bem = new Bem('view-full-schedule');

function ViewFullSchedule({ path, color, config, className }: ViewFullScheduleProps) {
	const contentStyle = convertColorToBackgroundStyle(color);
	const redirectPath = path || getPathByKey(EPG, config);

	return (
		<Link to={redirectPath} className={cx(bem.b(), className)}>
			<div className={bem.e('content')} style={contentStyle}>
				<div className={bem.e('packshot')} />
				<IntlFormatter elementType="div" className={cx(bem.e('title'), 'truncate')}>
					{`@{view_full_schedule|View Full Schedule}`}
				</IntlFormatter>
			</div>
		</Link>
	);
}

function mapStateToProps(state: state.Root) {
	return {
		config: state.app.config
	};
}

export default connect<any, any, ViewFullScheduleProps>(mapStateToProps)(ViewFullSchedule);
