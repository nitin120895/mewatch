import * as React from 'react';
import * as cx from 'classnames';

interface CollapsibleFieldSetProps extends React.HTMLProps<HTMLFieldSetElement> {
	label: string;
	collapsed?: boolean;
}

interface CollapsibleFieldsetState {
	collapsed: boolean;
}

export default class CollapsibleFieldSet extends React.Component<CollapsibleFieldSetProps, CollapsibleFieldsetState> {
	static defaultProps = {
		collapsed: false
	};

	constructor(props) {
		super(props);
		this.state = { collapsed: props.collapsed };
	}

	private onToggleCollapse = e => {
		this.setState((prevState: CollapsibleFieldsetState) => {
			return { collapsed: !prevState.collapsed };
		});
	};

	render() {
		const { label, children } = this.props;
		const { collapsed } = this.state;
		const direction = collapsed ? '▼' : '▲';
		const classes = cx('fs', { 'fs--collapsed': collapsed });
		return (
			<fieldset className={classes}>
				<legend onClick={this.onToggleCollapse}>{`${direction} ${label}`}</legend>
				{children}
			</fieldset>
		);
	}
}
